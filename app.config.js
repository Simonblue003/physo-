export default ({ config }) => {
  return {
    ...config,
    expo: {
      ...(config.expo || {}),
      name: "Desk Reset",
      slug: "desk-reset",
      owner: "martiankings",
      android: {
        ...(config.expo?.android || {}),
        package: "com.martiankings.deskreset"
      },
      extra: {
        ...(config.expo?.extra || {}),
        eas: {
          projectId: "ec60ae2e-cef0-40bb-8cd4-b51730bf5998"
        }
      }
    }
  };
};
