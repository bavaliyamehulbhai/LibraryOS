const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something Went Wrong"
  );
};

export default getErrorMessage;
