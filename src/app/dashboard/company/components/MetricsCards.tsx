"use client";

import { useMetrics } from "@/hooks/useMetrics";
import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  ChatBubbleLeftRightIcon,
  CubeIcon,
  UsersIcon,
  CpuChipIcon,
  UserGroupIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

const defaultMetrics = {
  messages_sent_total: 0,
  messages_allowed_total: 0,
  products_created_total: 0,
  products_allowed_total: 0,
  users_created_total: 0,
  users_allowed_total: 0,
  prospects_contacted_total: 0,
  prospects_allowed_total: 0,
  tokens_used_current_month: 0,
  tokens_allowance_monthly: 0,
  tokens_purchased_total: 0,
};

export function MetricsCards() {
  const { metrics, loading: metricsLoading } = useMetrics();

  // Use metrics from the hook, fallback to default only if null/undefined
  const data = metrics || defaultMetrics;

  const metricsConfig = [
    {
      title: "Tokens Used",
      icon: CpuChipIcon,
      value: data.tokens_used_current_month || 0,
      color: "bg-blue-500",
    },
    {
      title: "Token Allowance",
      icon: CpuChipIcon,
      value: data.tokens_allowance_monthly || 0,
      color: "bg-blue-600",
    },
    {
      title: "Tokens Purchased",
      icon: ShoppingCartIcon,
      value: data.tokens_purchased_total || 0,
      color: "bg-indigo-500",
    },
    {
      title: "Messages Sent",
      icon: ChatBubbleLeftRightIcon,
      value: data.messages_sent_total || 0,
      color: "bg-orange-500",
    },
    {
      title: "Messages Allowed",
      icon: ChatBubbleLeftRightIcon,
      value: data.messages_allowed_total || 0,
      color: "bg-orange-600",
    },
    {
      title: "Products Created",
      icon: CubeIcon,
      value: data.products_created_total || 0,
      color: "bg-amber-500",
    },
    {
      title: "Products Allowed",
      icon: CubeIcon,
      value: data.products_allowed_total || 0,
      color: "bg-amber-600",
    },
    {
      title: "Users Created",
      icon: UsersIcon,
      value: data.users_created_total || 0,
      color: "bg-purple-500",
    },
    {
      title: "Users Allowed",
      icon: UsersIcon,
      value: data.users_allowed_total || 0,
      color: "bg-purple-600",
    },
    {
      title: "Prospects Contacted",
      icon: UserGroupIcon,
      value: data.prospects_contacted_total || 0,
      color: "bg-green-500",
    },
    {
      title: "Prospects Allowed",
      icon: UserGroupIcon,
      value: data.prospects_allowed_total || 0,
      color: "bg-green-600",
    },
  ];

  if (metricsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(11)].map((_, i) => (
          <Card
            key={i}
            className="animate-pulse bg-white border border-gray-200"
          >
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardBody>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metricsConfig.map((metric, index) => {
        const Icon = metric.icon;

        return (
          <Card key={index} className={`${metric.color} border-none shadow-md`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <h4 className="text-sm font-medium text-white">{metric.title}</h4>
              <Icon className="h-5 w-5 text-white" />
            </CardHeader>
            <CardBody className="pt-0">
              <div className="text-3xl font-bold text-white">
                {metric.value.toLocaleString()}
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
