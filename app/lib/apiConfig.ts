const ApiConfig = {
  // Auth
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",

  // User
  analyzeStore: "/store-intelligence/analyze",
  USER_DETAILS: (id: string) => `/users/${id}`,
  UPDATE_USER: (id: string) => `/users/${id}`,

  // Blog
  BLOGS: "/blogs",
  BLOG_DETAILS: (id: string) => `/blogs/${id}`,
  CREATE_BLOG: "/blog/generate",
  GENERATE_BLOGCAMPAIGN: "/blog/generate-campaign",
  PUBLISH_BLOG:(blogId:string)=>`/publish/${blogId}`,
  SCHEDULE_BLOG:(blogId:string)=>`/publish/${blogId}/schedule`,
  // Shopify
  PRODUCTS: "/shopify/products",
  COLLECTIONS: "/shopify/collections",
  getCountry:"country-events",
  getEvents:(country:string)=>`country-events/${country}`,
  saveBlogDraft:(blogId:string)=>`/blog/${blogId}/draft`,
  // Future APIs...
};

export default ApiConfig;