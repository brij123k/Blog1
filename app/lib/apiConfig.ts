const ApiConfig = {
  // Auth
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",

  // User
  analyzeStore: "/store-intelligence/analyze",
  USER_DETAILS: (id: string) => `/users/${id}`,
  UPDATE_USER: (id: string) => `/users/${id}`,
  UPDATETOPICS:`/store-intelligence/topics/generate`,
  // Blog
  BLOGS: "/blog",
  ALLBLOGS: "/blog/all",
  BLOG_DETAILS: (id: string) => `/blog/${id}`,
  CREATE_BLOG: "/blog/generate",
  GENERATE_BLOGCAMPAIGN: "/blog/generate-campaign",
  PUBLISH_BLOG:(blogId:string)=>`/publish/${blogId}`,
  SCHEDULE_BLOG:(blogId:string)=>`/publish/${blogId}/schedule`,
  // Shopify
  PRODUCTS: "/shopify/products",
  COLLECTIONS: "/shopify/collections",
  getCountry:"country-events",
  addCountry:"/store-intelligence/primary-market",
  getEvents:(country:string)=>`country-events/${country}`,
  saveBlogDraft:(blogId:string)=>`/blog/${blogId}/draft`,
  

  getActivePlans:"/plans",
  userPlan:"/user-subscription/me",
};

export default ApiConfig;