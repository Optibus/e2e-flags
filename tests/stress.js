import { sleep } from "k6";
import http from "k6/http";

const url = "https://flags-api-internal.optibus.com/hash";
export const options = {
  vus: 50,
  duration: "30s",
};
export default function () {
  http.get(url);
  sleep(1);
}
