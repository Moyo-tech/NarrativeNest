'use client'

import Link from 'next/link'
import { FiHome, FiChevronRight } from 'react-icons/fi'
import { cn } from '@/lib/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {/* Home icon */}
      <Link
        href="/"
        className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors duration-200"
      >
        <FiHome className="h-4 w-4" />
      </Link>

      {/* Breadcrumb trail */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-2">
            <FiChevronRight className="h-4 w-4 text-neutral-500" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-xl transition-colors duration-200',
                  'text-neutral-300 hover:text-white hover:bg-primary-800'
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'px-3 py-1.5 rounded-xl',
                  isLast
                    ? 'text-white font-medium bg-primary-800'
                    : 'text-neutral-400'
                )}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
