const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')

beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of helper.initialBlogs) {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }
})

test('blogs are returned as json', async () => {
    console.log('entered test')
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')

    const ids = response.body.map(r => r.id)
    expect(ids).toBeDefined()
})

test('posting blog is successful', async () => {
    const newBlog = {
        title: "Hello",
        author: "Christian",
        url: "a.com",
        likes: "1000",
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
})

test('likes default to zero if not included', async () => {
    const newBlog = {
        title: "Hello",
        author: "Christian",
        url: "a.com",
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    const likes = blogsAtEnd.map(r => r.likes)
    expect(likes).toContain(
        0
    )
})

test('expect status 400 when no title/url', async () => {
    const newBlog = {
        title: "Hello",
        author: "Christian",
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

})

afterAll(async () => {
    await mongoose.connection.close()
  })