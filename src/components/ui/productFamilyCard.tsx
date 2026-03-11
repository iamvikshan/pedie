import type { ProductFamily } from '@app-types/product'
import { calculateDiscount, formatKes } from '@helpers'
import Image from 'next/image'
import Link from 'next/link'
import { TbFlame, TbPhoto } from 'react-icons/tb'
import { ConditionBadge } from './conditionBadge'

export const PRODUCT_FAMILY_CARD_ICONS = ['TbPhoto', 'TbFlame'] as const

interface ProductFamilyCardProps {
  family: ProductFamily
}

export function ProductFamilyCard({ family }: ProductFamilyCardProps) {
  const { product, representative } = family
  if (!product || !representative) return null

  const productName = product.name
  const isSale =
    representative.sale_price_kes != null &&
    representative.sale_price_kes < representative.price_kes
  const effectivePrice = isSale
    ? representative.sale_price_kes!
    : representative.price_kes
  const discount = isSale
    ? calculateDiscount(representative.price_kes, effectivePrice)
    : 0
  const imageUrl = representative.images?.[0] || product.images?.[0]

  return (
    <Link
      href={`/products/${product.slug}`}
      className='group flex flex-col glass rounded-lg shadow-sm overflow-hidden transition-colors duration-300 border border-pedie-border hover:border-pedie-green/30'
      aria-label={`View ${productName}`}
    >
      {/* Image Section */}
      <div className='relative aspect-[3/4] bg-pedie-surface w-full overflow-hidden'>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className='object-contain transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-pedie-text-muted'>
            <TbPhoto className='w-12 h-12' aria-hidden='true' />
          </div>
        )}

        {/* Top-left badges */}
        <div className='absolute top-2 left-2 flex flex-col gap-2'>
          {isSale ? (
            <span className='glass bg-pedie-discount/20 backdrop-blur-sm text-pedie-discount text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1'>
              <TbFlame className='w-3.5 h-3.5' aria-hidden='true' />
              Flash Sale
            </span>
          ) : (
            <span className='glass backdrop-blur-sm rounded-full px-2 py-1'>
              <ConditionBadge condition={representative.condition} />
            </span>
          )}
        </div>

        {/* Top-right badges */}
        <div className='absolute top-2 right-2 flex flex-col gap-1.5 items-end'>
          {isSale && (
            <ConditionBadge
              condition={representative.condition}
              variant='circle'
            />
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className='p-4 flex flex-col flex-grow'>
        <h3 className='text-sm font-semibold text-pedie-text mb-1 line-clamp-2'>
          {productName}
        </h3>

        {/* Pricing */}
        <div className='mt-auto pt-3 border-t border-pedie-border min-h-[60px]'>
          {isSale ? (
            <div className='flex flex-col'>
              <div className='flex items-baseline gap-2 flex-wrap'>
                <span className='text-base font-bold text-pedie-discount'>
                  {formatKes(effectivePrice)}
                </span>
                <span className='glass text-pedie-discount text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm'>
                  -{discount}%
                </span>
              </div>
              <span className='text-sm text-pedie-text-muted line-through'>
                {formatKes(representative.price_kes)}
              </span>
            </div>
          ) : (
            <div className='flex flex-col'>
              <span className='text-base font-bold text-pedie-accent'>
                {formatKes(effectivePrice)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
