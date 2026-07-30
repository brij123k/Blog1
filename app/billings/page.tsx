"use client";

import React, { useState, useEffect, FC, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ApiService from "../lib/service";
import ApiConfig from "../lib/apiConfig";
import { CreditCard } from "lucide-react";

interface Plan {
  _id: string;
  name: string;
  price: number;
  ForDays: number;
  analyticsEnabled: boolean;
  articalsNumber: number;
  maxTopics: number;
  maxStores: number;
  scheduleEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserSubscription {
  _id: string;
  userId: string;
  planId: Plan;
  status: "active" | "inactive" | "expired";
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
  limits: {
    articles: number;
    topics: number;
  };
  usage: {
    articles: number;
    topics: number;
  };
  remaining: {
    articles: number;
    topics: number;
  };
  remainingDays: number;
  createdAt: string;
  updatedAt: string;
}

const BillingPage: FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch plans and user subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all active plans
        const plansResponse = await ApiService.get(ApiConfig.getActivePlans);
        setPlans(plansResponse || []);
        
        // Fetch user's current subscription
        try {
          const subscriptionResponse = await ApiService.get(ApiConfig.userPlan);
          if (subscriptionResponse) {
            setCurrentSubscription(subscriptionResponse);
            // Auto-select the user's current plan
            if (subscriptionResponse.planId?._id) {
              setSelectedPlan(subscriptionResponse.planId._id);
            }
          }
        } catch (error) {
          // User has no active subscription
          console.log("No active subscription found");
          if (plansResponse && plansResponse.length > 0) {
            setSelectedPlan(plansResponse[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast("Failed to load plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toast = (message: string) => {
    setToastMsg(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSubscribe = async (planId: string) => {
    setIsSubscribing(true);
    try {
      // await ApiService.post(ApiConfig.subscribe, { planId });
      
      const plan = plans.find(p => p._id === planId);
      toast(`Successfully subscribed to ${plan?.name}!`);
      
      // Refresh subscription data
      const subscriptionResponse = await ApiService.get(ApiConfig.userPlan);
      if (subscriptionResponse) {
        setCurrentSubscription(subscriptionResponse);
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  // const handleCancelSubscription = async () => {
  //   try {
  //     await ApiService.post(ApiConfig.cancelSubscription, {});
  //     toast("Subscription cancelled successfully");
  //     setCurrentSubscription(null);
  //     if (plans.length > 0) {
  //       setSelectedPlan(plans[0]._id);
  //     }
  //   } catch (error) {
  //     console.error("Failed to cancel subscription:", error);
  //     toast("Failed to cancel subscription. Please try again.");
  //   }
  // };

  const getPlanBadge = (plan: Plan) => {
    if (currentSubscription?.planId?._id === plan._id && currentSubscription.status === "active") {
      return (
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Current Plan
        </span>
      );
    }
    if (plan.name.toLowerCase().includes("premium") || 
        plan.name.toLowerCase().includes("enterprise") ||
        plan.name.toLowerCase().includes("pro") ||
        plan.name.toLowerCase().includes("advanced")) {
      return (
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white">
          Popular
        </span>
      );
    }
    return null;
  };

  const formatDays = (days: number) => {
    if (days === 30) return "Monthly";
    if (days === 90) return "Quarterly";
    if (days === 365) return "Yearly";
    return `${days} Days`;
  };

  const getRemainingDaysText = (days: number) => {
    if (days === 0) return "Expired";
    if (days === 1) return "1 day remaining";
    return `${days} days remaining`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back Link */}
      <div 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm cursor-pointer transition-colors mb-6"
        onClick={() => window.history.back()}
      >
        ← Back to Dashboard
      </div>

      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-1">
          💳 Billing & Plans
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Choose the perfect plan for your blog studio needs
        </p>
      </div>

      {/* Current Plan Section */}
      {currentSubscription && (
        <motion.div
          className="bg-gradient-to-br from-[#1b2138]/95 to-[#0f1321]/95 border border-blue-500/20 rounded-xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-blue-500/30 flex-shrink-0">
              <CreditCard/>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-base sm:text-lg font-semibold">
                {currentSubscription.planId?.name || "Current Plan"}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm truncate">
                Active since {new Date(currentSubscription.startedAt).toLocaleDateString()} · 
                Expires {new Date(currentSubscription.expiresAt).toLocaleDateString()}
              </p>
              <p className="text-emerald-400 text-xs sm:text-sm mt-0.5">
                {getRemainingDaysText(currentSubscription.remainingDays)}
              </p>
              <div className="flex flex-wrap gap-3 mt-1.5">
                <span className="text-xs sm:text-sm text-slate-400">
                  Articles: <span className="text-white font-medium">{currentSubscription.usage.articles}/{currentSubscription.limits.articles}</span>
                </span>
                <span className="text-xs sm:text-sm text-slate-400">
                  Topics: <span className="text-white font-medium">{currentSubscription.usage.topics}/{currentSubscription.limits.topics}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
              currentSubscription.status === "active" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}>
              {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
            </span>
            {/* Uncomment to enable cancel button */}
            {/* <button 
              className="px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
              onClick={handleCancelSubscription}
            >
              Cancel
            </button> */}
          </div>
        </motion.div>
      )}

      {/* Plans Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
          <div className="w-10 h-10 border-3 border-blue-500/15 border-t-blue-400 rounded-full animate-spin mb-4"></div>
          <p>Loading available plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-white text-xl mb-2">No plans available</h3>
          <p>Please check back later for available subscription plans.</p>
        </div>
      ) : (
        <div className="w-full">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {plans.map((plan, index) => {
                const isSelected = selectedPlan === plan._id;
                const isActive = currentSubscription?.planId?._id === plan._id && currentSubscription?.status === "active";
                const isPopular = plan.name.toLowerCase().includes("premium") || 
                                 plan.name.toLowerCase().includes("pro") ||
                                 plan.name.toLowerCase().includes("advanced") ||
                                 plan.name.toLowerCase().includes("enterprise");
                const badge = getPlanBadge(plan);

                return (
                  <motion.div
                    key={plan._id}
                    className={`bg-gradient-to-b from-[#1b2138]/95 to-[#0f1321]/95 border rounded-xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col ${
                      isSelected 
                        ? "border-blue-500/60 shadow-lg shadow-blue-500/15" 
                        : "border-blue-500/20 hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30"
                    } ${isPopular ? "popular-card" : ""}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    onClick={() => !isActive && setSelectedPlan(plan._id)}
                  >
                    {/* Popular card top bar */}
                    {/* {isPopular && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    )} */}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                          <CreditCard/>
                        </div>
                        <span className="text-white text-base sm:text-lg font-semibold">{plan.name}</span>
                      </div>
                      {badge}
                    </div>

                    <div className="mb-1">
                      <span className="text-3xl sm:text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-slate-400 text-sm ml-1">/{formatDays(plan.ForDays).toLowerCase()}</span>
                    </div>
                    <div className="text-slate-400 text-xs sm:text-sm mb-4">{formatDays(plan.ForDays)} billing cycle</div>

                    <ul className="space-y-2 mb-5 flex-1">
                      <li className="flex items-center gap-2.5 text-slate-300 text-sm">
                        <span className="text-emerald-400 flex-shrink-0">✓</span>
                        {plan.articalsNumber} Articles per {formatDays(plan.ForDays).toLowerCase()}
                      </li>
                      <li className="flex items-center gap-2.5 text-slate-300 text-sm">
                        <span className="text-emerald-400 flex-shrink-0">✓</span>
                        {plan.maxTopics} Topics per article
                      </li>
                      <li className="flex items-center gap-2.5 text-slate-300 text-sm">
                        <span className={plan.analyticsEnabled ? "text-emerald-400 flex-shrink-0" : "text-red-400 flex-shrink-0"}>
                          {plan.analyticsEnabled ? "✓" : "✗"}
                        </span>
                        {plan.analyticsEnabled ? "Advanced Analytics" : "Basic Analytics"}
                      </li>
                      <li className="flex items-center gap-2.5 text-slate-300 text-sm">
                        <span className={plan.scheduleEnabled ? "text-emerald-400 flex-shrink-0" : "text-red-400 flex-shrink-0"}>
                          {plan.scheduleEnabled ? "✓" : "✗"}
                        </span>
                        {plan.scheduleEnabled ? "Schedule & Publish" : "Schedule Publishing"}
                      </li>
                      {plan.maxStores > 1 && (
                        <li className="flex items-center gap-2.5 text-slate-300 text-sm">
                          <span className="text-emerald-400 flex-shrink-0">✓</span>
                          {plan.maxStores} Stores included
                        </li>
                      )}
                    </ul>

                    <button
                      className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default hover:scale-100"
                          : "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      }`}
                      disabled={isSubscribing || isActive}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isActive) handleSubscribe(plan._id);
                      }}
                    >
                      {isSubscribing && selectedPlan === plan._id ? (
                        <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : isActive ? (
                        "✓ Current Plan"
                      ) : (
                        "Subscribe Now"
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#12182c]/95 text-white px-5 py-3 rounded-xl border border-blue-500/20 text-sm shadow-xl transition-opacity duration-300 ${
        toastMsg ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}>
        {toastMsg}
      </div>
    </div>
  );
};

export default BillingPage;