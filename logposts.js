require('dotenv').config()

async function fetchPosts(){
    const response = await fetch(process.env.API_URL)

    const posts = await response.json()

    console.log(posts)
}

fetchPosts()