<template>
    <div class="edit-listing-page">
        <div v-if="isLoading" class="loading">
            <VueSpinner size="40" color="var(--secondary)" aria-label="Loading profile..." />
        </div>
        <div v-else class="container">
            <h1 class="title">Edit Listing</h1>
            <div class="listing-card">
                <!-- insert photo section -->
                <div class="photo">
                    <!-- <img :src="listing_pic"/>  -->
                    <img ref="cropperImg" :src="listing_pic ?? defaultPic" class="cropper-img"/>

                    <div class="cropper-actions" v-if="isCropping">
                        <button @click="onCancel" class="btn btn-outline cropper-btn">Cancel</button>
                        <button @click="onSave" class="btn btn-primary cropper-btn">Save</button>
                    </div>

                    <div class="cropper-actions" v-else-if="listing_pic">
                        <button @click="onRemove" class="btn btn-danger after-crop-btn">Remove Photo</button>
                        <button type="button" class="btn btn-primary after-crop-btn"   @click="triggerFileInput">   
                        Change Photo
                        </button>
                    </div>

                    <div class="cropper-actions" v-else>
                    <button type="button" class="btn btn-primary"   @click="triggerFileInput">   
                        Upload Photo
                    </button>
                    </div>
                    <input
                        ref="fileInput"
                        type="file"
                        accept=".jpg,.jpeg,.png,.heic,.heif"
                        style="display: none"
                        @change="uploadlistingpic"
                    />

                    <p class="input-info file-requirements">
                        Uploading a photo is optional.<br>
                        Supported file types: jpg, jpeg, png, heic, heif. Maximum file size: 5MB. 
                    </p>
                </div>

                <!-- service title & description -->
                <div class="title-and-desc"> 
                    <input v-model="title" placeholder="Service Title" required 
                    type="text" class="input-field"/>
                    
                    <!-- description -->
                    <textarea v-model="description" placeholder="Write your description here (min 10 words, max 800)!" required 
                    class="input-field"/>
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
                <button @click="updatelisting" class="btn btn-secondary">Update</button>
                </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import { db } from "../firebase.js";
import { getCurrentUser } from '@/auth.js';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import defaultPic from '@/assets/listing_pics/default_list_pic.png'
import axios from 'axios';
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.min.css";
import { VueSpinner } from 'vue3-spinners';


const CLOUDINARY_CLOUD_NAME = "dwr4f7ae0";
const CLOUDINARY_UPLOAD_PRESET = "nusos-listing-pics";

export default {
    name: 'EditListing',

    components: {
        VueSpinner,
    },

    data(){
        return {
            defaultPic,
            isLoading: true,
            listing_id: null,
            listing_pic: null,
            prevFile: null,
            file_to_upload: null,
            isCropping: false,
            cropper: null,
            title: "",
            description: "",
            payment_mode: "",
            listing_category: "",
            location_text: "",
            submitting: false,
        }
    },

    computed: {
        wordCount() {
            if (!this.description) return 0;
            return this.description.trim().split(/\s+/).length;
        },
    },

    // get rdy to get the old data
    async mounted() {
        this.listing_id = this.$route.params.listing_id; //get listing_id from url

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
                    this.listing_pic = data.picture_url;
                    //this.isLoading = false;
                }

            }
            catch(error) {
                console.error("Error", error)
                alert("No info collected")
            }
        },

        async updatelisting() { //to save the changes made 
            if (this.submitting) return; //prevent multiple clicks
            this.submitting = true;

            if (!this.title || !this.description) {
                alert("Please fill in the title and description!")
                this.submitting = false;
                return;
            } 

            if (this.description && (this.wordCount < 10 || this.wordCount >800)) {
                alert(`Please stay within the word count of 10 to 800 words! You are currently at: ${this.wordCount} words`)
                this.submitting = false;
                return;
              }

            if (!this.payment_mode || !this.listing_category || !this.location_text) {
                alert("Please fill in all the dropdown boxes!");
                this.submitting = false;
                return;
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
                });
                alert("Successful Update!")
                this.$router.push('/my-listings') //send person back to their listings pg 
            } catch(error) {
                console.error("Error", error)
                alert("Unable to update")
            } finally {
                this.submitting = false;
            }
        },

        async triggerFileInput() {
            this.$refs.fileInput.value = "";
            this.$refs.fileInput.click();
        },

        async uploadlistingpic(event) {
            const file = event.target.files[0]; //just take first one in case user select too many
            if (!file) return;

            const approvedFormats = ["image/jpg", "image/jpeg", "image/png", "image/heic", "image/heif"];
            if (!approvedFormats.includes(file.type)) {
                alert('Please only upload approved file formats!')
                return;
            }

            this.prevFile = this.file_to_upload ?? this.listing_pic;
            this.file_to_upload = file; 
            this.listing_pic = URL.createObjectURL(file); 
            this.isCropping = true;

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
        },

        onCancel() {
            if (this.prevFile) {
                if (typeof this.prevFile === 'string') {
                    this.listing_pic = this.prevFile; 
                    this.file_to_upload = null;
                } else {
                    this.listing_pic = URL.createObjectURL(this.prevFile);
                    this.file_to_upload = this.prevFile;
                }
                this.prevFile = null;
            } else {
                this.file_to_upload = null;
                this.listing_pic = null;
            }
            this.destroyCropper();
            this.$refs.fileInput.value = "";
            this.isCropping = false;
        },

        //Remove the selected image 
        onRemove() {
            this.listing_pic = null;
            this.prevFile = null;
            this.file_to_upload = null;
            if (this.cropper) this.cropper.destroy();
            this.$refs.fileInput.value = "";
            this.isCropping = false;
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
            this.isCropping = false;
        },

        async uploadToCloudinary(blob, uid) {
            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            formData.append("public_id", `listing-pics-${uid}-${Date.now()}`); //update with new time

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
.loading {
    display: flex;
    align-content: center;
    justify-content: center;
}

.title {
  font-size: 36px;
  color: var(--primary);
  text-align: center;
}

.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;

}

.listing-card {
    width: 75%;
    padding: 36px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    justify-content: center;
    align-items: center;
    overflow: visible;
    position: relative;
    margin-bottom: 50px;
    background-color: #DDEBFB;
    border-radius: var(--radius);
    border: 1px solid var(--primary);
}

/* photo */
.photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.cropper-img {
    width: 50%;
    height: auto;
    display: block;
    object-fit: contain;
}

.cropper-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 8px;
}

.btn-outline {
  background-color: white;
}

.btn-outline:hover { 
  background: rgb(240, 243, 247); 
}

.cropper-btn {
    width: 10rem;
}

.after-crop-btn {
    width: 10rem;
}

.file-requirements {
    min-height: 0;
    text-align: center;
}

.title-and-desc {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
}

/* for text instruction */
.text-instruct{
    font-size: 14px;
    font-weight: bold;
    width: 100%;
}

textarea {
    width: 100%;
    font-size: 14px;
    resize: none; /*dont adjust the size of box */
    height: 200px;
    font-family: inherit;

}

/* the dropdown UIs */
.dropdown {
  display: flex;
  gap: 30px; 
  align-items: center;
  justify-content: space-between;
  margin-top: 10px; 
  width: 100%;
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
  cursor: pointer;
  background-color: #F8C38A;
  border: 1px solid var(--gray4);
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: medium;
  min-width: max-content;
}

.dropdown-coloured:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--card-shadow);
}

/* button */
.button-wrapper {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 9px 52px;
}
</style>