import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API, API_CREATE, API_POSTS, API_STATUS } from "../constants";

const initialState = {
  posts: [],
  status: API_STATUS.idle,
  error: null,
};

export const fetchPosts = createAsyncThunk("notes/fetchPosts", async () => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(API + API_POSTS, {
    headers: { Authorization: `JWT ${token}` },
  });
  return response.data;
});

export const addNewPost = createAsyncThunk(
  "notes/addNewPost",
  async (newPost) => {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(API + API_CREATE, newPost, {
      headers: { Authorization: `JWT ${token}` },
    });
    return response.data;
  }
);

export const updatePostThunk = createAsyncThunk(
  "notes/updatePost",
  async (updatedPost) => {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      API + API_POSTS + "/" + updatedPost.id,
      updatedPost,
      { headers: { Authorization: `JWT ${token}` } }
    );
    return response.data;
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
        const { id, title, content } = action.payload;
        // const id = action.payload.id
        // const title = action.payload.title
        // const content = action.payload.content
        const existingPost = state.posts.find((post) => post.id === id);
        if (existingPost) {
          existingPost.title = title;
          existingPost.content = content;
        }
      });
  },
});

export const { noteAdded } = notesSlice.actions;

export default notesSlice.reducer;
