<template>
    <div class="container">
        <div class="listing-card">
            <h1 style="text-align: center">Create New Listing</h1>

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
            <button @click="createlisting" class="btn-secondary">UPLOAD</button>
            </div>
        </div>
    </div>

</template>


<script>
import { db } from "../firebase.js";
import { getCurrentUser } from '@/auth.js';
import { addDoc, collection, getDoc, doc } from "firebase/firestore";
import defaultPic from '@/assets/listing_pics/default_list_pic.jpg';
import axios from 'axios';
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.min.css";

const CLOUDINARY_CLOUD_NAME = "dwr4f7ae0";
const CLOUDINARY_UPLOAD_PRESET = "nusos-listing-pics";

export default {
  name: 'AddListing',

  data() {
    return {
      listing_pic: defaultPic,   //preview image url
      file_to_upload: null,       //acttual file being uploaded to cloudinary
      cropper: null,               //cropper instance
      //All of the form fields
      title: "",
      description: "",
      payment_mode: "",
      listing_category: "",
      location_text: "",
      //submission state
      submitted: false,
      submitting: false,     
      //cropper helpers using in destroyCropper function to reset states    
      cropperReady: false,      
      isSaving: false,           
    };
  },

  computed: {
    //Word Count Functon for description field
    wordCount() {
      if (!this.description) return 0;
      return this.description.trim().split(/\s+/).length;
    },
  },

  methods: {
    //Handle Image Selection
    async uploadlistingpic(event) {
      const file = event.target.files[0];
      if (!file) return;

      const approvedFormats = ["image/jpg", "image/jpeg", "image/png", "image/heic", "image/heif"];
      if (!approvedFormats.includes(file.type)) {
        alert('Please only upload approved file formats!');
        return;
      }

      this.file_to_upload = file;
      this.listing_pic = URL.createObjectURL(file);

      //Intialised the Cropper after DOM updated with the new image
      this.$nextTick(() => {
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
      });
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

    // upload to Cloudinary
    async uploadToCloudinary(blob, uid) {
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      //Changed this becauase we want to be able to track the listing pics in cloudinary with the uid and timestamp for easier management
      formData.append("public_id", `listing-pics-${uid}-${Date.now()}`);

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

    //Create Listing Function 
    async createlisting() {
      // Prevent double submission
      if (this.submitting) return;
      this.submitting = true;

      // Validate required fields
      if (!this.title || !this.description) {
        alert("Please fill in the title and description!");
        this.submitting = false;
        return;
      }

      // Validate description existence and word count
      //Word Count between 10 and 800 words
      if (this.description && (this.wordCount < 10 || this.wordCount > 800)) {
        alert(`Please stay within 10 to 800 words! You are currently at: ${this.wordCount} words`);
        this.submitting = false;
        return;
      }

      // Validate dropdown selections
      if (!this.payment_mode || !this.listing_category || !this.location_text) {
        alert("Please fill in all the dropdown boxes!");
        this.submitting = false;
        return;
      }
    // Proceed with upload if all validations pass
      try {
        //Get the current user's uid for the listing
        const user = await getCurrentUser();
        if (!user) throw new Error("User not logged in");

        // Load the username from Firestore
        const userDoc = (await getDoc(doc(db, "users", user.uid))).data();
        const username = userDoc?.username ?? "Unknown User";

        //Get the picture_url ready for upload to Firestore. If there is no picture selected, it will be nulll
        const picture_url = this.file_to_upload
        ? await this.uploadToCloudinary(this.file_to_upload, user.uid)
        : null;

        console.log("This is the url:", picture_url);

        await addDoc(collection(db, "listings"), {
          lister_id: user.uid,
          lister_name: username,
          title: this.title,
          description: this.description,
          created_at: new Date(),
          location_text: this.location_text,
          picture_url: picture_url,
          payment_mode: this.payment_mode,
          listing_category: this.listing_category,
          status: "Awaiting",
          count: 0,
        });
        alert("Successful Upload!");

        // Reset form AFTER successful upload
        this.file_to_upload = null;
        this.listing_pic = defaultPic;
        this.title = "";
        this.description = "";
        this.payment_mode = "";
        this.listing_category = "";
        this.location_text = "";

        const input = document.querySelector('input[type="file"]');
        if (input) input.value = "";

      } catch (error) {
        console.log("Error", error);
        alert("Unsuccessful Upload...");
      } 
      this.submitting = false;
    },
  },
};
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