import { describe, expect, mock, test } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

// Mock next/image
mock.module('next/image', () => ({
  default: mock(({ src, alt, fill, ...props }: Record<string, unknown>) => {
    return React.createElement('img', {
      src,
      alt,
      'data-fill': fill ? 'true' : undefined,
      ...props,
    })
  }),
}))

const { ImageGallery } = await import('@components/listing/imageGallery')

describe('ImageGallery', () => {
  test('renders main image', () => {
    const html = renderToString(
      <ImageGallery
        images={[
          'https://example.com/img1.jpg',
          'https://example.com/img2.jpg',
        ]}
        productName='iPhone 13'
      />
    )

    expect(html).toContain('https://example.com/img1.jpg')
    expect(html).toContain('alt="iPhone 13"')
  })

  test('renders thumbnail for each image', () => {
    const images = [
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
      'https://example.com/img3.jpg',
    ]
    const html = renderToString(
      <ImageGallery images={images} productName='iPhone 13' />
    )

    // Should have thumbnail buttons
    expect(html).toContain('View image 1')
    expect(html).toContain('View image 2')
    expect(html).toContain('View image 3')

    // All thumbnail images should be present
    for (const img of images) {
      expect(html).toContain(img)
    }
  })

  test('shows placeholder when no images', () => {
    const html = renderToString(
      <ImageGallery images={[]} productName='iPhone 13' />
    )

    expect(html).toContain('No images available')
  })

  test('does not render thumbnails for single image', () => {
    const html = renderToString(
      <ImageGallery
        images={['https://example.com/img1.jpg']}
        productName='iPhone 13'
      />
    )

    expect(html).toContain('https://example.com/img1.jpg')
    expect(html).not.toContain('View image 1')
  })
})
