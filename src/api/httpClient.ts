import axios from "axios";
import {environment} from "../environments/environment"

const httpClient = axios.create({
  baseURL: environment.apiUrl,
  headers: { "Content-Type": "application/json" },
});

export default httpClient;
