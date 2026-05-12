import { queryClient } from "@/lib/queryClient";
import Reactotron from "reactotron-react-native";
import {
  QueryClientManager,
  reactotronReactQuery,
} from "reactotron-react-query";

if (__DEV__) {
  const queryClientManager = new QueryClientManager({ queryClient });

  Reactotron.configure({ name: "Tuitional LMS Mobile" })
    .useReactNative({
      networking: {
        ignoreUrls: /symbolicate|logs|hot-update/,
      },
    })
    .use(reactotronReactQuery(queryClientManager))
    .connect();

  Reactotron.clear?.();

  // Expose for ad-hoc logging from anywhere: console.tron.log(...)
  (console as unknown as { tron: typeof Reactotron }).tron = Reactotron;
}

export default Reactotron;
