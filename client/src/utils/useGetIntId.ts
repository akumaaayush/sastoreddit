import { useRouter } from "next/router";

const useGetIntId = () => {
  const router = useRouter();
  return typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
};

export default useGetIntId;
