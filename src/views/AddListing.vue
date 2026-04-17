<template>
    <div class="container">
      <h1 class="title">Create New Listing</h1>
        <div class="listing-card">
            <!-- insert photo section -->
            <div class="photo">
                <!-- <img :src="listing_pic"/>  -->
                <img ref="cropperImg" :src="listing_pic" class="cropper-img"/>

                <div class="cropper-actions" v-if="isCropping">
                    <button @click="onCancel" class="btn btn-outline cropper-btn">Cancel</button>
                    <button @click="onSave" class="btn btn-primary cropper-btn">Save</button>
                </div>

                <div class="cropper-actions" v-else-if="file_to_upload">
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
            <!-- image/jpg, image/jpeg, image/png, image/heic, image/heif -> actly im thinking if its better to not let them select unsupported photos from the get go is better -->

            <!-- service title & description -->
            <div class="title-and-desc"> 
                <input v-model="title" placeholder="Service Title" required 
                  type="text" class="input-field"/>
                
                <!-- description -->
                <textarea v-model="description" placeholder="Write your description here (min 10 words, max 800)!" required 
                  class="input-field"/>
            </div>

            <!-- dropwdown selection -->
            <div class="text-instruct">Please select one option in the all the drop-down boxes. Mandatory fields! </div>
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
              <button @click="createlisting" class="btn btn-secondary">Upload</button>
              </div>
            </div>

        </div>
    </div>

</template>


<script>
import { db } from "../firebase.js";
import { getCurrentUser } from '@/auth.js';
import { addDoc, collection, getDoc, doc } from "firebase/firestore";
import defaultPic from '@/assets/listing_pics/default_list_pic.png';
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
      prevFile: null,            //previous file before cropping (used for reverting if user cancels cropping)
      file_to_upload: null,       //acttual file being uploaded to cloudinary
      isCropping: false,
      cropper: null,               //cropper instance
      //All of the form fields
      title: "",
      description: "",
      payment_mode: "",
      listing_category: "",
      location_text: "",
      //submission state
      submitting: false,                  
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
    async triggerFileInput() {
      this.$refs.fileInput.value = "";
      this.$refs.fileInput.click();
    },

    //Handle Image Selection
    async uploadlistingpic(event) {
      const file = event.target.files[0];
      if (!file) return;

      const approvedFormats = ["image/jpg", "image/jpeg", "image/png", "image/heic", "image/heif"];
      if (!approvedFormats.includes(file.type)) {
        alert('Please only upload approved file formats!');
        return;
      }

      this.prevFile = this.file_to_upload; 
      this.file_to_upload = file;
      this.listing_pic = URL.createObjectURL(file);
      this.isCropping = true;

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
    },

    onCancel() {
      if (this.prevFile) {
        this.file_to_upload = this.prevFile;
        this.listing_pic = URL.createObjectURL(this.prevFile);
        this.prevFile = null;
      } else {
        this.file_to_upload = null;
        this.listing_pic = defaultPic;
      }
      this.destroyCropper();
      this.$refs.fileInput.value = "";
      this.isCropping = false;
    },

    //Remove the selected image 
    onRemove() {
      this.listing_pic = defaultPic;
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
          applicants: [],
          provider_id: null,
          clicks_by_day: {},
          clicks_by_hour: {},
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
        this.$router.push('/my-listings'); // Redirect to mylistings after successful upload
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
  font-weight: 500;
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