<template>
    <div class="container">
        <div class="listing-card">
            <h1 style="text-align: center">Edit Listing</h1>

            <!-- insert photo section -->
            <div class="photo">
                <!-- <img :src="listing_pic"/>  -->
                <img ref="cropperImg" :src="listing_pic" class="cropper-img"/>
                <p class="text-instruct">Ensure that you photo is of .jpg, .jpeg, .png, .heic, or .heif format. Else, default photo will be used!</p>
                <input type="file" @change="uploadlistingpic" accept="image/*"></input>
            </div>
            <!-- image/jpg, image/jpeg, image/png, image/heic, image/heif -> actly im thinking if its better to not let them select unsupported photos from the get go is better -->

            <div class="cropper-actions" v-if="file_to_upload">
                <button @click="onSave" class="btn-primary">Save</button>
                <button @click="onRemove" class="btn-primary">Remove</button>
            </div>

            <!-- service title & description -->
            <div class="text-instruct"> 
                <input v-model="title" placeholder="[Service Title]" required></input>
                <p v-if="submitted && !title" class="error-message">Mandatory Title!</p>
                <hr style="border:0; border-top: 2px solid black; background-color: black; margin: 0 0 8px 0;">        
                
                <!-- description -->
                <textarea v-model="description" placeholder="Write your description here (min 10 words, max 800)!" required></textarea>
                
            </div>

            <!-- dropwdown selection -->
            <div class="text-instruct">Please select one option in the all the drop-down boxes. Mandatory field! </div>
            <div class="dropdown">
              <div class="dropdown-group">
                <div class="dropdown-choices">
                  <select v-model="payment_mode" class="dropdown-coloured">
                    <option disabled value="">Payment Mode</option>
                    <option>Cash</option>
                    <option>Treat to Food</option>
                    <option>Drinks on me</option>
                    <option>Free</option>
                    <option>Contact me</option>
                </select>
                </div>
                
                <div class="dropdown-choices">
                <select v-model="listing_category" class="dropdown-coloured">
                    <option disabled value="">Category</option>
                    <option>Education</option>
                    <option>Buddy</option>
                    <option>Survival</option>
                </select>
                </div>

                <div class="dropdown-choices">
                <select v-model="location_text" class="dropdown-coloured">
                    <option disabled value="">Location</option>
                    <option>UTown</option>
                    <option>Central Library</option>
                    <option>FASS</option>
                    <option>SoC</option>
                    <option>Business School</option>
                    <option>Engineering buidling</option>
                    <option>Kent Ridge MRT</option>
                    <option>YST</option>
                </select>
                </div>
              </div>

              <!-- button -->
              <div class="button-wrapper">
              <button @click="updatelisting" class="btn-listing">UPDATE</button>
              </div>
            </div>

        </div>

        <!-- Analytics Section -->
        <div class="analytics-card">
            <div class="analytics-total">
                <span class="analytics-number">{{ totalClicks }}</span>
                <span class="analytics-label">Total Views</span>
            </div>
            <p class="analytics-subtitle">No. of times people clicked to view your listing details</p>
            <Line v-if="chartData" :data="chartData" :options="chartOptions" />
            <p v-else class="no-data">No click data yet.</p>
        </div>
    </div>
</template>


<script>
import { ref, computed } from 'vue'
import { db } from "../firebase.js";
import { getCurrentUser } from '@/auth.js';
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import defaultPic from '@/assets/listing_pics/default_list_pic.jpg'
import axios from 'axios';
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.min.css";
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)


const CLOUDINARY_CLOUD_NAME = "dwr4f7ae0";
const CLOUDINARY_UPLOAD_PRESET = "nusos-listing-pics";

export default {
    name: 'EditListing',
    components: { Line },
    data(){
        return {
            listing_id: null,
            listing_pic: defaultPic,
            file_to_upload: null,
            cropper: null,
            title: "",
            description: "",
            payment_mode: "",
            listing_category: "",
            location_text: "",
            submitted: false,
            submitting: false,
            cropperReady: false,
            isSaving: false,
            clicksByDay: {},
        }
    },

    computed: {
        wordCount() {
            if (!this.description) return 0;
            return this.description.trim().split(/\s+/).length;
        },
        totalClicks() {
            return Object.values(this.clicksByDay).reduce((sum, v) => sum + v, 0);
        },
        chartData() {
            const entries = Object.entries(this.clicksByDay).sort(([a], [b]) => a.localeCompare(b));
            if (!entries.length) return null;
            return {
                labels: entries.map(([date]) => {
                    const [, , day] = date.split('-');
                    return `${parseInt(day)} ${new Date(date).toLocaleString('en-GB', { month: 'short' })}`;
                }),
                datasets: [{
                    data: entries.map(([, count]) => count),
                    borderColor: '#003D7C',
                    backgroundColor: 'rgba(0,61,124,0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                }],
            };
        },
        chartOptions() {
            return {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            };
        },
    },

    // get rdy to get the old data
    async mounted() {
        this.listing_id = this.$route.params.listing_id; //get listing_id from url
        console.log(this.listing_id);

        if (!this.listing_id) { //just in case no listing with this id
            alert("Listing unavailable");
            this.$router.push('/my-listings') //just redirect them back to my listings
            return
        };

        await this.getListingInfo(); //get old listing data
    },

    methods: {
        async getListingInfo() {
            try { 
                const doclistRef = doc(db, "listings", this.listing_id);
                const docgetlist = await getDoc(doclistRef);

                if (docgetlist.exists()) {
                    const data = docgetlist.data();
                    this.title = data.title;
                    this.description = data.description;
                    this.payment_mode = data.payment_mode;
                    this.listing_category = data.listing_category;
                    this.location_text = data.location_text;
                    this.listing_pic = data.picture_url || defaultPic;
                    this.clicksByDay = data.clicks_by_day ?? {};
                }

            }
            catch(error) {
                console.error("Error", error)
                alert("No info collected")
            }
        },

        async updatelisting() { //to save the changes made 
            this.submitted = true;

            if (!this.title || !this.description) {
                alert("Please fill in the title and description!")
                return;
            } 

            if (this.description && (this.wordCount < 10 || this.wordCount >800)) {
                  alert(`Please stay within the word count of 10 to 800 words! You are currently at: ${this.wordCount} words`)
                  return;
              }

            if (!this.payment_mode || !this.listing_category || !this.location_text) {
                alert("Please fill in all the dropdown boxes!")
            }
            
            try {
                let picture_url = this.listing_pic //keep old url by default 
                const user = await getCurrentUser();
                if (this.file_to_upload) {
                    const uploadedUrl = await this.uploadToCloudinary(this.file_to_upload, user.uid);
                    if (uploadedUrl) picture_url = uploadedUrl;
        
                }
                const doclistRef = doc(db, "listings", this.listing_id);
                await updateDoc(doclistRef, {
                    title: this.title,
                    description: this.description,
                    payment_mode: this.payment_mode,
                    listing_category: this.listing_category,
                    location_text: this.location_text,
                    picture_url: picture_url, //new photo 
                    created_at: new Date() //just update the timing


                });
                alert("Successful Update!")
                this.$router.push('/my-listings') //send person back to their listings pg 
            } catch(error) {
                console.error("Error", error)
                alert("Unable to update")
            }

            
        },


        async uploadlistingpic(event) {
            const file = event.target.files[0]; //just take first one in case user select too many
            if (!file) return;

            const approvedFormats = ["image/jpg", "image/jpeg", "image/png", "image/heic", "image/heif"];
            if (!approvedFormats.includes(file.type)) {
                alert('Please only upload approved file formats!')
                return;
            }

            this.file_to_upload = file;
            this.listing_pic = URL.createObjectURL(file); 

            this.$nextTick( () => {
                if (this.cropper) this.cropper.destroy();
                this.cropper = new Cropper(this.$refs.cropperImg, {
                aspectRatio: 4 / 3,
                viewMode: 1,
                dragMode: "move",
                autoCropArea: 1,
                cropBoxMovable: false,
                cropBoxResizable: false,
                toggleDragModeOnDblclick: false,
                });
            }
            );
        },

        //Destroying the Cropper instance 
        destroyCropper() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        this.cropperReady = false;
        this.isSaving = false;
        },

        //Remove the selected image 
        onRemove() {
        this.listing_pic = defaultPic;
        this.file_to_upload = null;
        if (this.cropper) this.cropper.destroy();
        this.cropper = null;

        const input = document.querySelector('input[type="file"]');
        if (input) input.value = '';
        },

        //Save Cropped Image and prepare for upload
        async onSave() {
        if (!this.cropper) return;

        const canvas = this.cropper.getCroppedCanvas({
            width: 800,
            height: 600,
        });

        const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.9)
        );

        this.listing_pic = URL.createObjectURL(blob);
        this.file_to_upload = blob;
        this.destroyCropper();
        this.cropper = null;
        },

        async uploadToCloudinary(blob, uid) {
            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            formData.append("public_id", `listing-pics${uid}`); //uodate with new time

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData,
            );

            if (response.status !== 200) {
                throw new Error("Cloudinary upload failed");
            }

            const data = response.data;
            return data.secure_url; 
        },

    }
}
</script>


<style scoped>
@import '@/assets/main.css';

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 50px;

}

.listing-card {
    width: 800px;
    border-radius: 10px;
    padding: 20px;
    padding-bottom: 210px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    justify-content: center;
    align-items: center;
    background-color: #89CFF0;
    overflow: visible;
    position: relative;
    margin-bottom: 50px;
}

/* photo */
.photo {
    width: 100%;
    max-width: 500px;
    margin: 0 auto 10px auto;
    overflow: hidden;
    border-radius: 10px;

}

.cropper-img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
}

.cropper-actions {
    margin: 10px 0;
    display: flex;
    gap: 10px;
    justify-content: center;
}



/* for text instruction */
.text-instruct{
    font-size: 12px;
    width: 100%;
    margin-bottom: 5px;
    font-family: Arial, Helvetica, sans-serif;
}


input {
    width: 100%;
    font-family: Arial, Helvetica, sans-serif;
    background-color: rgb(205, 239, 251);

}

textarea {
    width: 100%;
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;
    resize: none; /*dont adjust the size of box */
    height: 200px;
    background-color: rgb(205, 239, 251);

}

/* the dropdown UIs */
.dropdown {
  display: flex;
  gap: 30px; 
  align-items: flex-start;
  margin-top: 10px; 
}

.dropdown-group {
  display: flex;
  gap: 20px;
}

.dropdown-choices {
  flex: 1;
}

.dropdown-coloured {
  width: 100%;
  padding: 5px 5px;
  cursor: pointer;
  border: 1px solid;
  background-color: #ff944d;
  border-color: #000;
}

.dropdown-coloured option {
  background-color: bisque;
}


/* analytics */
.analytics-card {
    margin-top: 32px;
    background: #fff;
    border-radius: 10px;
    padding: 20px 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.analytics-total {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 4px;
}
.analytics-number {
    font-size: 48px;
    font-weight: 700;
    color: #003D7C;
    line-height: 1;
}
.analytics-label {
    font-size: 16px;
    font-weight: 600;
    color: #6E6E6E;
}
.analytics-subtitle {
    font-size: 12px;
    color: #9CA3AF;
    margin-bottom: 16px;
}
.no-data {
    color: #9CA3AF;
    font-size: 13px;
    text-align: center;
    padding: 24px 0;
}

/* button */
.btn-listing{
  width: 100%;
  padding: 10px 0px;
  background-color: #ff944d;
  color: white;
  font-size: 15px;
  cursor: pointer;
}

.button-wrapper {
  flex: 1;
  min-width: 120px;
  justify-content: flex-end;
}

</style>