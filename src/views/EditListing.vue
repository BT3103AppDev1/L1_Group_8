<template>
    <div class="container">
        <div class="listing-card">
            <h1 style="text-align: center">Edit Listing</h1>

            <!-- insert photo section -->
            <div class="photo">
                <!-- <img :src="listing_pic"/>  -->
                <img ref="cropperImg" :src="listing_pic" class="cropper-img"/>
                <p class="hint">Ensure that you photo is of .jpg, .jpeg, .png, .heic, or .heif format. Else, default photo will be used!</p>
                <input type="file" @change="uploadlistingpic" accept="image/*"></input>
            </div>
            <!-- image/jpg, image/jpeg, image/png, image/heic, image/heif -> actly im thinking if its better to not let them select unsupported photos from the get go is better -->

            <div class="cropper-actions" v-if="file_to_upload">
                <button @click="onSave">Save</button>
                <button @click="onRemove">Remove</button>
            </div>

            <!-- service title & description -->
            <div class="service-description">
                <input v-model="title" placeholder="[Service Title]" required></input>
                <p v-if="submitted && !title" class="error-message">Mandatory Title!</p>
                <hr style="border:0; border-top: 2px solid black; background-color: black; margin: 0 0 8px 0;">        
                
                <textarea v-model="description" placeholder="Write your description here (min 10 words, max 800)!" required></textarea>
                
            </div>

            <!-- dropwdown selection -->
            <div class="dropdown">
                <select v-model="payment_mode">
                    <option disabled value="">Payment Mode</option>
                    <option>Cash</option>
                    <option>Treat to Food</option>
                    <option>Drinks on me</option>
                    <option>Free</option>
                    <option>Contact me</option>
                </select>

                <select v-model="listing_category">
                    <option disabled value="">Category</option>
                    <option>Education</option>
                    <option>Buddy</option>
                    <option>Survival</option>
                </select>

                <select v-model="location_text">
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

            <!-- button -->
            <div class="button-design">
            <button @click="updatelisting" class="btn-secondary">UPDATE</button>
            </div>
        </div>
    </div>

</template>


<script>
import { ref, computed } from 'vue'
import { db } from "../firebase.js";
import { getCurrentUser } from '@/auth.js';
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import defaultPic from '@/assets/listing_pics/default_list_pic.jpg'
import axios from 'axios';
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.min.css";

const CLOUDINARY_CLOUD_NAME = "dwr4f7ae0";
const CLOUDINARY_UPLOAD_PRESET = "nusos-listing-pics";

export default {
    name: 'EditListing',
    data(){
        return {
            listing_id: null,
            listing_pic: defaultPic, //only for display
            file_to_upload: null, 
            cropper: null,
            title: "",
            description: "",
            payment_mode: "",
            listing_category: "",
            location_text: "",
            submitted: false,
            submitting: false,
            //cropper helpers using in destroyCropper function to reset states    
            cropperReady: false, 
            isSaving: false,
        }
    },

    computed: {
        wordCount() {
            if (!this.description) return 0;
            else return this.description.trim().split(/\s+/).length

        }
        
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
                    this.payment_mode = data.payment_mode,
                    this.listing_category = data.listing_category,
                    this.location_text= data.location_text,
                    this.listing_pic = data.picture_url //this one i got to edit after that following xinyan's stroage for the pics
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

                if (this.file_to_upload) {
                    const uploadedUrl = await this.uploadToCloudinary(this.file_to_upload);
                    if (uploadedUrl) picture_url = uploadedUrl;

                }
                const doclistRef = doc(db, "listings", this.listing_id);
                await updateDoc(doclistRef, {
                    title: this.title,
                    description: this.description,
                    payment_mode: this.payment_mode,
                    listing_category: this.listing_category,
                    location_text: this.location_text,
                    picture_url, //new photo 
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

        async uploadToCloudinary(blob, uid) {
            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            formData.append("public_id", `listing-pics${uid}`);

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
.container {
    display: flex;
    justify-content: center;
    align-items: center;

}

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


.listing-card {
    width: 600px;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    justify-content: center;
    align-items: center;
}

.service-description{
    font-size: 11px;
    width: 100%;
    margin-bottom: 20px;
    font-family: Arial, Helvetica, sans-serif;
}

/* old one dont use pls */
/* .upload-button {
    display: flex;
    padding: 8px;
    font-size: 16px;
    cursor: pointer;
    font-family: Arial, Helvetica, sans-serif;
    color: white;
    background-color: #EF7C00;
    border: none;
    justify-content: center;
    align-items: center;
} */


input {
    width: 100%;
    font-family: Arial, Helvetica, sans-serif;

}

textarea {
    width: 100%;
    font-size: 11px;
    font-family: Arial, Helvetica, sans-serif;
    resize: none; /*dont adjust the size of box */
    height: 200px

}
</style>