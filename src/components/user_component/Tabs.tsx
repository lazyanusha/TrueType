import React, {
  isValidElement,
  cloneElement,
  useState,
  type ReactNode,
} from "react";

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
};

export const Tabs = ({ defaultValue, children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const clonedChildren = React.Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    // Cast child to ReactElement with props that include activeTab and setActiveTab
    if ((child.type as any).displayName === "TabsList") {
      return cloneElement(
        child as React.ReactElement<{
          activeTab: string;
          setActiveTab: (val: string) => void;
        }>,
        {
          activeTab,
          setActiveTab,
        }
      );
    }

    if ((child.type as any).displayName === "TabsContent") {
      return cloneElement(child as React.ReactElement<{ activeTab: string }>, {
        activeTab,
      });
    }

    return child;
  });

  return <div>{clonedChildren}</div>;
};

type TabsListProps = React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  activeTab?: string;
  setActiveTab?: (val: string) => void;
};

export const TabsList = ({
  children,
  activeTab,
  setActiveTab,
  className,
  ...props
}: TabsListProps) => {
  const clonedChildren = React.Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    if ((child.type as any).displayName === "TabsTrigger") {
      return cloneElement(
        child as React.ReactElement<{
          activeTab: string;
          setActiveTab: (val: string) => void;
        }>,
        {
          activeTab,
          setActiveTab,
        }
      );
    }

    return child;
  });

  return (
    <div
      className={`flex border-b border-gray-300 mb-6 ${className ?? ""}`}
      {...props}
    >
      {clonedChildren}
    </div>
  );
};
TabsList.displayName = "TabsList";

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  children: ReactNode;
  activeTab?: string;
  setActiveTab?: (val: string) => void;
};

export const TabsTrigger = ({
  value,
  children,
  activeTab,
  setActiveTab,
  className,
  ...props
}: TabsTriggerProps) => {
  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
        activeTab === value
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-600 hover:text-blue-500"
      } ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
};
TabsTrigger.displayName = "TabsTrigger";

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  children: ReactNode;
  activeTab?: string;
  height?: string;
};

export const TabsContent = ({
  value,
  children,
  activeTab,
  className,
  height = "h-[400px]",
  ...props
}: TabsContentProps) => {
  if (activeTab !== value) return null;
  return (
    
    <div className={`${height} overflow-y-auto ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
};
TabsContent.displayName = "TabsContent";
