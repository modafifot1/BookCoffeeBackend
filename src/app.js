import { Server, dbConnection, envVariables } from "./configs";
import { defaultMiddleware, errorHandleMiddleware } from "./middlewares";

import {
  authRoute,
  foodRoute,
  cartRoute,
  orderRoute,
  tableRoute,
  employeeRoute,
  customerRoute,
} from "./routers";
const { port, connectString } = envVariables;
const main = async () => {
  const server = new Server(port);

  server.registerMiddleware(defaultMiddleware);
  server.listen();
  dbConnection(connectString);
  server.registerRouter(authRoute);
  server.registerRouter(foodRoute);
  server.registerRouter(cartRoute);
  server.registerRouter(orderRoute);
  server.registerRouter(tableRoute);
  server.registerRouter(employeeRoute);
  server.registerRouter(customerRoute);
  server.registerMiddleware(errorHandleMiddleware);
};
main();
