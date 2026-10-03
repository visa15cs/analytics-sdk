import { AnalyticsSdk } from "./analytics";
console.log('hello')
const analytics = new AnalyticsSdk({
  batchSize: 3,
  flushInterval: 3000,
});

analytics.track("button_click", {
  buttonId: "signup",
});

analytics.track("page_view", {
  page: "/home",
});

analytics.track("button_click", {
  buttonId: "login",
});

analytics.track("button_click2", {
  buttonId: "login-3",
});
