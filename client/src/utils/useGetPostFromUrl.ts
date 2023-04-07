import { usePostQuery } from "../generated/graphql";
import useGetIntId from "./useGetIntId";

const useGetPostFromUrl = () => {
  const intId = useGetIntId();
  return usePostQuery({
    pause: intId === -1, //pause request when no query id
    variables: {
      id: intId,
    },
  });
};

export default useGetPostFromUrl;
