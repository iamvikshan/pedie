'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Clamp selectedIndex to valid range without useEffect to avoid cascading renders
  const safeIndex =
    images.length === 0 ? 0 : Math.min(selectedIndex, images.length - 1)

  if (!images || images.length === 0) {
    return (
      <div className='flex items-center justify-center rounded-lg border border-pedie-border bg-pedie-card aspect-square'>
        <div className='text-center text-pedie-text-muted'>
          <svg
            className='mx-auto h-16 w-16 mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z'
            />
          </svg>
          <p>No images available</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='relative aspect-square rounded-lg border border-pedie-border bg-pedie-card overflow-hidden'>
        <Image
          src={images[safeIndex]}
          alt={productName}
          fill
          className='object-contain'
          sizes='(max-width: 768px) 100vw, 50vw'
          priority
        />
      </div>
      {images.length > 1 && (
        <div className='mt-3 flex gap-2 overflow-x-auto'>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-16 w-16 flex-shrink-0 rounded-md border overflow-hidden ${
                index === safeIndex
                  ? 'border-pedie-green ring-2 ring-pedie-green'
                  : 'border-pedie-border hover:border-pedie-text-muted'
              }`}
              aria-label={`View image ${index + 1}`}
              aria-pressed={index === safeIndex}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className='object-cover'
                sizes='64px'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
