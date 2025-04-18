declare module "recharts" {
    import * as React from "react";
  
    export interface ResponsiveContainerProps {
      width: number | string;
      height: number | string;
      className?: string;
      children?: React.ReactNode;
    }
    export const ResponsiveContainer: React.FC<ResponsiveContainerProps>;
  
    export interface AreaChartProps {
      data: any[];
      margin?: { top: number; right: number; left: number; bottom: number };
      children?: React.ReactNode;
    }
    export const AreaChart: React.FC<AreaChartProps>;
  
    export interface AreaProps {
      type: string;
      dataKey: string;
      stroke: string;
      fillOpacity: number;
      fill: string;
    }
    export const Area: React.FC<AreaProps>;
  
    export interface XAxisProps {
      dataKey: string;
      fontSize?: number;
      axisLine?: boolean;
      interval?: number | string;
    }
    export const XAxis: React.FC<XAxisProps>;
  
    export interface YAxisProps {
      fontSize?: number;
    }
    export const YAxis: React.FC<YAxisProps>;
  
    export interface CartesianGridProps {
      strokeDasharray: string;
      vertical?: boolean;
    }
    export const CartesianGrid: React.FC<CartesianGridProps>;
  
    export interface TooltipProps {
      content?: React.ReactNode;
    }
    export const Tooltip: React.FC<TooltipProps>;
  }
  