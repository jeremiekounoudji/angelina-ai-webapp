"use client";

import { useMetrics } from "@/hooks/useMetrics";
import { useTokenUsage } from "@/hooks/useTokenUsage";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardBody, CardHeader, Progress } from "@heroui/react";
import {
  ChatBubbleLeftRightIcon,
  CubeIcon,
  UsersIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

const defaultMetrics = {
  messages_sent_total: 1250,
  messages_allowed_total: 5000,
  products_created_total: 23,
  products_allowed_total: 100,
  users_created_total: 8,
  users_allowed_total: 25,
  prospects_contacted_total: 342,
  prospects_allowed_total: 1000,
};

export function MetricsCards() {
  const { metrics, loading } = useMetrics();
  const { company } = useAuth();
  const { usage, loading: tokenLoading } = useTokenUsage(company?.id);
  const { t } = useTranslationNamespace('dashboard.company.metrics');

  const data = metrics || defaultMetrics;

  const metricsConfig = [
    {
      title: t('tokensUsed'),
      icon: CpuChipIcon,
      current: usage?.tokens_used || 0,
      total: (usage?.tokens_remaining || 0) + (usage?.tokens_used || 0),
      color: "primary",
      bgColor: "bg-blue-500",
      cardBg: "bg-blue-500",
      textColor: "text-white",
      iconColor: "text-white",
      loading: tokenLoading,
    },
    {
      title: t('productsCreated'),
      icon: CubeIcon,
      current: data.products_created_total,
      total: data.products_allowed_total,
      color: "success",
      bgColor: "bg-green-900",
      cardBg: "bg-amber-500",
      textColor: "text-white",
      iconColor: "text-white",
      loading: false,
    },
    {
      title: t('usersCreated'),
      icon: UsersIcon,
      current: data.users_created_total,
      total: data.users_allowed_total,
      color: "secondary",
      bgColor: "bg-purple-500",
      cardBg: "bg-purple-500",
      textColor: "text-white",
      iconColor: "text-white",
      loading: false,
    },
    {
      title: t('messagesTotal'),
      icon: ChatBubbleLeftRightIcon,
      current: data.messages_sent_total,
      total: data.messages_allowed_total,
      color: "warning",
      bgColor: "bg-orange-500",
      cardBg: "bg-orange-500",
      textColor: "text-black",
      iconColor: "text-black",
      loading: false,
    },
  ];

  if (loading && tokenLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-background border border-secondary">
            <CardHeader className="pb-2">
              <div className="h-4 bg-secondary rounded w-3/4"></div>
            </CardHeader>
            <CardBody>
              <div className="h-8 bg-secondary rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-secondary rounded w-full"></div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsConfig.map((metric, index) => {
        const percentage = Math.round((metric.current / metric.total) * 100);
        const Icon = metric.icon;

        if (metric.loading) {
          return (
            <Card key={index} className="animate-pulse bg-background border border-secondary">
              <CardHeader className="pb-2">
                <div className="h-4 bg-secondary rounded w-3/4"></div>
              </CardHeader>
              <CardBody>
                <div className="h-8 bg-secondary rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-secondary rounded w-full"></div>
              </CardBody>
            </Card>
          );
        }

        return (
          <Card key={index} className="bg-background border border-secondary shadow-lg shadow-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <h4 className="text-sm font-medium text-white">
                {metric.title}
              </h4>
              <Icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardBody className="pt-0">
              <div className="text-2xl font-bold text-white mb-3">
                {metric.current.toLocaleString()}
                <span className="text-sm font-normal text-gray-50 ml-1">
                  / {metric.total.toLocaleString()}
                </span>
              </div>
              <Progress
                value={percentage}
                color="secondary"
                className="mb-2"
                size="sm"
              />
              <p className="text-xs text-gray-50">
                {percentage}% of limit used
              </p>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
