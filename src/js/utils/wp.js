import { getBody } from "@utils/dom";

export const hasAdminBar = () => getBody().classList.contains("admin-bar");

export default {
  hasAdminBar
};
