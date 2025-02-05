import { enableHttpInterceptor } from "./http-interceptor";

const SecretAgent = {
  init() {
    enableHttpInterceptor();
  },
}

export default SecretAgent;