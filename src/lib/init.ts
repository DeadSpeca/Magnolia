import * as Updates from "expo-updates";

// Disable all updates in development
if (__DEV__) {
  Updates.disableExpoGoUpdate();
}

export const initializeApp = () => {
  console.log("App initialized with updates disabled");
};
