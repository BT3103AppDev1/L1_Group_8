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
                <img 
                    :src="listing_pic"
                    alt="Listing Pic"
                    class="card-title mb-2"
                />
                <input type="file" @click="uploadlistingpic" accept="image/jpg, image/jpeg, image/png, image/heic, image/heif">
            </div>

            <!-- service title & description -->
            <div class="service-description">
                <input v-model="title" placeholder="[Service Title]" required></input>
                <hr style="border:0; border-top: 2px solid black; background-color: black; margin: 0 0 8px 0;">        
                <textarea v-model="description" placeholder="Write your description here!" required></textarea>
            </div>

            <!-- button -->
            <div class="button-design">
            <button @click="createlisting" class="upload-button">UPLOAD</button>
            </div>
        </div>
    </div>

</template>


<script>
import { db } from "../firebase.js";
import { addDoc, collection } from "firebase/firestore";
import defaultPic from '@/assets/listing_pics/default_list_pic.jpg'

export default {

    data(){
        return {
            listing_pic: defaultPic,
            selectedlistpic: null,
            title:"",
            description: "",
            successupload: false
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
        async createlisting() {
            if (!this.title || !this.description) {
                alert("Please fill in all mandatory fields!")
                return 
            } else {

            try {
            await addDoc(collection(db, "listings"), {
                title: this.title,
                description: this.description,
                createdon: new Date()
            })

            // reset everything after upload
            alert("Successful Upload!")
            this.selectedlistpic=null;
            this.listing_pic= defaultPic
            this.title = ""
            this.description = ""
    
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