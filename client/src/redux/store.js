import {combineReducers ,configureStore } from '@reduxjs/toolkit'
import userReducer from "./user/userSlice";
import messageReducer from "./message/messageSlice";
import {persistStore, persistReducer} from "redux-persist";
import sessionStorage from 'redux-persist/lib/storage/session';


const rootReducer = combineReducers({user: userReducer, message: messageReducer});

const persistConfig = {
    key: 'root',
    storage: sessionStorage,
    version: 1,
  };

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);