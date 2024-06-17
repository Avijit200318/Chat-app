import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    currentMessage: null,
    error: null,
}

const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        messageSuccess: (state, action) => {
            state.currentMessage = action.payload;
            state.error = null;
        },
        messageFailure: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {messageFailure, messageSuccess} = messageSlice.actions;
export default messageSlice.reducer;