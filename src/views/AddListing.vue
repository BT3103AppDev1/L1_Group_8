<!-- <template>
    <div> Add Listing </div>
</template>

<script>
export default {
    name: 'AddListing'
}
</script> -->



<template>
    <div class="container">
        <div class="listing-card">
            <h1 style="text-align: center">Create New Listing</h1>

            <!-- insert photo section -->
            <div class="photo">
                <img :src="listing_pic" class="preview-img"/>
                <p class="hint">Ensure that you photo is of .jpg, .jpeg, .png, .heic, or .heif format. Else, default photo will be used!</p>
                <input type="file" @change="uploadlistingpic" accept="image/jpg, image/jpeg, image/png, image/heic, image/heif"></input>
            </div>

            <!-- service title & description -->
            <div class="service-description">
                <input v-model="title" placeholder="[Service Title]" required></input>
                <p v-if="submitted && !title" class="error-message">Mandatory Title!</p>
                <hr style="border:0; border-top: 2px solid black; background-color: black; margin: 0 0 8px 0;">        
                
                <textarea v-model="description" placeholder="Write your description here (min 10 words, max 800)!" required></textarea>
                <p v-if="submitted && !description" class="error-message">Mandatory Description!</p>
                
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
                <p v-if="submitted && !payment_mode" class="error-message">Mandatory Payment Mode!</p>

                <select v-model="listing_category">
                    <option disabled value="">Category</option>
                    <option>Education</option>
                    <option>Buddy</option>
                    <option>Survival</option>
                    <p v-if="submitted && !listing_category" class="error-message">Mandatory Listing Category!</p>
                
                </select>

                <select v-model="location_text">
                    <option disabled value="">Location</option>
                    <option>UTown</option>
                    <option>Central Library</option>
                    <option>FASS</option>
                    <option>SoC</option>
                    <!-- check our documentation and add on more later -->
                     <p v-if="submitted && !location_text" class="error-message">Mandatory location!</p>

                </select>
                
            </div>

            <!-- button -->
            <div class="button-design">
            <button @click="createlisting" class="upload-button">UPLOAD</button>
            </div>
        </div>
    </div>

</template>


<script>
import { ref, computed } from 'vue'
import { db, storage, auth } from "../firebase.js";
import { addDoc, collection } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import defaultPic from '@/assets/listing_pics/default_list_pic.jpg'


export default {
    name: 'AddListing',
    data(){
        return {
            listing_pic: defaultPic, //only for display
            selectedlistpic: null, 
            picture_url: "", //go into firestore
            title: "",
            description: "",
            payment_mode: "",
            listing_category: "",
            location_text: "",
            submitted: false,
            successupload: false,
        }
    },

    methods: {
        async uploadlistingpic(event) {
            const file = event.target.files[0]; //just take first one in case user select too many
            if (!file) return;

            const approvedFormats = ['image/jpg', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];
            if (!approvedFormats.includes(file.type)) {
                alert('Please only upload approved file formats!')
                return;
            }

            this.selectedlistpic = file;
            this.listing_pic = URL.createObjectURL(file);
        },

        async uploadPic() {
            if (!this.selectedlistpic) return defaultPic;
            const ext = this.selectedlistpic.name.split('.').pop(); //i want to get the format 
            const path = `listings/${Date.now()}.${ext}`; //replace with the date if uploaded to name it unique
            const storageRef = storageRef(storage, path);
            await uploadBytes(storageRef, this.selectedlistpic); //to firebase storage
            return await getDownloadURL(storageRef);

        },

        async createlisting() {
            if (!this.title || !this.description) {
                alert("Please fill in all mandatory fields!")
                return 
            } else {

            try {
            await addDoc(collection(db, "listings"), {
                listing_id: this.listing_id,
                lister_id: this.lister_id,
                listing_category: this.category,
                title: this.title,
                description: this.description,
                location_text: this.location_text,
                picture_url: this.picture_url,
                payment_mode: this.payment_mode,
                listing_cateogry: this.listing_category,
                location_text: this.location_text,
                created_at: new Date()
            })

            // reset everything after upload
            alert("Successful Upload!")
            this.selectedlistpic=null;
            this.listing_pic= defaultPic;
            this.title = "";
            this.description = "";
            this.payment_mode = "";
            this.listing_category = "";
            this.location_text = "";

            //
            document.querySelector('input[type="file"]').value = ""; //empty the choose file again
    
            } catch(error) {
        console.log("Error", error)
        alert("Unsuccessful Upload...")
            }
    }
    }
    }
};
</script>


<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;

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

.upload-button {
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
}


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