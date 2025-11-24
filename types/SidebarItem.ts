export interface ISidebarItem {
  title: string;
  icon: React.ReactNode;
  link: string;
  isActive: boolean;
  trailingItem?: React.ReactNode;
  disablClick?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}
