
const VideoPlayer = () => {
  return (
    <div
      style={{
        width: "80%",
        maxWidth: "800px",
        margin: "50px auto",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <video
        width="100%"
        controls
        autoPlay
        loop
        muted
        src="/6961824-uhd_3840_2160_30fps.mp4"
        style={{ display: "block" }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
