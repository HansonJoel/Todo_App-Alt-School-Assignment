const generateOTP = async () => {
  try {
    return (otp = `${Math.floor(1000 + Math.random() * 90000)}`);
  } catch (error) {
    throw error;
  }
};

module.exports = generateOTP;
