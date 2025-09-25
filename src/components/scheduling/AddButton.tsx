import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * 添加按钮组件 - 用于添加工地或员工
 */
export function AddButton({ onClick, className }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
         "flex items-center justify-center rounded-full bg-[#f9bc60] text-white p-2 shadow-lg hover:bg-[#e6ac50] transition-all duration-200 active:scale-95",
        className
      )}
      aria-label="添加"
    >
      <Plus size={18} />
    </button>
  );
}