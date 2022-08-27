import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { API_STATUS } from "../constants";
import { db } from "../firebase";
const initialState = {
  posts: [],
  status: API_STATUS.idle,
  error: null,
};

export const fetchPosts = createAsyncThunk("notes/fetchPosts", async () => {
  const querySnapshot = await getDocs(collection(db, "notes"));
  const notes = querySnapshot.docs.map((doc) => {
    // doc.data() = {id: 123, title: 'Hello', content: 'world'}
    return { id: doc.id, ...doc.data() };
  });
  return notes;
});

export const addNewPost = createAsyncThunk(
  "notes/addNewPost",
  async (newPost) => {
    await setDoc(doc(db, "notes", newPost.id), newPost);
    return newPost;
  }
);

export const updatePostThunk = createAsyncThunk(
  "notes/updatePost",
  async (updatedPost) => {
    await updateDoc(doc(db, "notes", updatedPost.id), updatedPost);
    return updatedPost;
  }
);

export const deletePostThunk = createAsyncThunk(
  "posts/deletePost",
  async (id) => {
    await deleteDoc(doc(db, "notes", id));
    return id;
  }
);

const notesSlice = createSlice({
  name: "notes",
  initialState,
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = API_STATUS.pending;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = API_STATUS.fulfilled;
        // action.payload refers to the response.data
        // example of response.data {id: 1, title: 'Hello', content: 'World'}
        state.posts = state.posts.concat(action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = API_STATUS.rejected;
        state.error = action.error.message;
        console.log("Failed. Error:", action.error.message);
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.posts.push(action.payload);
      })
      .addCase(updatePostThunk.fulfilled, (state, action) => {
        const { id } = action.payload;
        const posts = state.posts;
        // const id = action.payload.id
        const post = state.posts.find((post) => post.id === id);
        const postIndex = posts.indexOf(post);
        if (~postIndex) posts[postIndex] = action.payload;
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        const id = action.payload;
        const updatedPosts = state.posts.filter((item) => item.id !== id);
        state.posts = updatedPosts;
      });
  },
});

export const { noteAdded } = notesSlice.actions;

export default notesSlice.reducer;
