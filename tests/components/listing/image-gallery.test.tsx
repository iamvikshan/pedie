import { describe, expect, test } from 'bun:test'
import React from 'react'
import { mockNextImage, render, screen } from '../../utils'

mockNextImage()

const { ImageGallery } = await import('@components/listing/imageGallery')

describe('ImageGallery', () => {
  test('renders main image', () => {
    render(
      <ImageGallery
        images={[
          'https://example.com/img1.jpg',
          'https://example.com/img2.jpg',
        ]}
        productName='iPhone 13'
      />
    )

    const mainImage = screen.getByAltText('iPhone 13')
    expect(mainImage).toBeInTheDocument()
    expect(mainImage).toHaveAttribute('src', 'https://example.com/img1.jpg')
  })

  test('renders thumbnail for each image', () => {
    const images = [
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
      'https://example.com/img3.jpg',
    ]
    render(<ImageGallery images={images} productName='iPhone 13' />)

    // Should have thumbnail buttons
    expect(
      screen.getByRole('button', { name: 'View image 1' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'View image 2' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'View image 3' })
    ).toBeInTheDocument()

    // All images should be present (main + 3 thumbnails)
    const allImages = screen.getAllByRole('img')
    expect(allImages.length).toBeGreaterThanOrEqual(images.length)
  })

  test('shows placeholder when no images', () => {
    render(<ImageGallery images={[]} productName='iPhone 13' />)

    expect(screen.getByText('No images available')).toBeInTheDocument()
  })

  test('does not render thumbnails for single image', () => {
    render(
      <ImageGallery
        images={['https://example.com/img1.jpg']}
        productName='iPhone 13'
      />
    )

    const mainImage = screen.getByAltText('iPhone 13')
    expect(mainImage).toHaveAttribute('src', 'https://example.com/img1.jpg')
    expect(
      screen.queryByRole('button', { name: 'View image 1' })
    ).not.toBeInTheDocument()
  })
})
