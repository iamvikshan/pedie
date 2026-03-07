'use client'

import Image from 'next/image'
import { useState } from 'react'
import { TbPhoto } from 'react-icons/tb'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const galleryImages = images ?? []

  if (galleryImages.length === 0) {
    return (
      <div className='flex items-center justify-center rounded-lg border border-pedie-border bg-pedie-card aspect-square'>
        <div className='text-center text-pedie-text-muted'>
          <TbPhoto className='mx-auto mb-2 h-16 w-16' aria-hidden='true' />
          <p>No images available</p>
        </div>
      </div>
    )
  }

  // Clamp selectedIndex to valid range without useEffect to avoid cascading renders
  const safeIndex = Math.min(selectedIndex, galleryImages.length - 1)

  return (
    <div>
      <div className='relative aspect-square rounded-lg border border-pedie-border bg-pedie-card overflow-hidden'>
        <Image
          src={galleryImages[safeIndex]}
          alt={productName}
          fill
          className='object-contain'
          sizes='(max-width: 768px) 100vw, 50vw'
          priority
        />
      </div>
      {galleryImages.length > 1 && (
        <div className='mt-3 flex gap-2 overflow-x-auto'>
          {galleryImages.map((image, index) => (
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
