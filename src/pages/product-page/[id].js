import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import styled from 'styled-components'
import dynamic from 'next/dynamic'

import ProductInfo from '../../components/productPage/ProductInfo'
import AddToCart from '../../components/productPage/AddToCart'
import ToggleButtons from '../../components/productPage/ToggleButtons'
import Reviews from '../../components/productPage/Reviews'
import ProductSlider from '../../components/productPage/ProductSlider'
const Comments = dynamic(() => import('../../components/productPage/Comments'))

export async function getServerSideProps(ctx) {
  const data = await fetch(`${
    process.env.NODE_ENV === "production"
      ? process.env.PROD_CMS_URL
      : process.env.DEV_CMS_URL
    }/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          product(id: ${ctx.params.id}) {
            data {
              id
              attributes {
                title
                company
                description
                price
                available
                reviews
                image {
                  data {
                    id
                    attributes {
                      name
                      alternativeText
                      url
                      formats
                    }
                  }
                }
                category {
                  data {
                    attributes {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `
    })
  })
    .then(r => r.json())
    .catch(err => console.error(err.message))
  
  const dataItem = data.data.product.data

  return {
    props: { dataItem }
  }
}

export default function ProductPage({ dataItem }) {  
  const id = dataItem.id
  const attributes = dataItem.attributes

  const title = attributes.title
  const company = attributes.company
  const description = attributes.description
  const price = attributes.price
  const available = attributes.available
  const category = attributes.category.data.attributes.name
  const categoryPath = category.trim().toLowerCase().replace(' ', '-')
  const images = attributes.image.data

  const [ isReviewsTabVisible, setIsReviewsTabVisible ] = useState(true)

  const toggleTabs = e => {
    if (e.target.name === 'reviews') {
      setIsReviewsTabVisible(true)
    } else if (e.target.name === 'comments') {
      setIsReviewsTabVisible(false)
    }
  }

  return (
    <>
      <Head>
        <title>Buy {title} - Alimazon</title>
        <meta name="description" content={`${title} - the LOWEST price, the BEST quality!!!`} />
      </Head>

      <DivProductPage>
        <nav aria-label="breadcrumb" className="nav">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/"><a>Home</a></Link></li>
            <li className="breadcrumb-item">
              <Link href="/products/[category]/[page]" as={`/products/${categoryPath}/1`}>
                <a>{category}</a>
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">{title}</li>
          </ol>
        </nav>
        <ProductSlider images={images} />
        <ProductInfo title={title} company={company} description={description} price={price} />
        <AddToCart id={id} available={available} />
        <ToggleButtons toggleTabs={toggleTabs} isReviewsTabVisible={isReviewsTabVisible} />
        {
          isReviewsTabVisible
          ? <Reviews id={id} />
          : <Comments />
        }
      </DivProductPage>
    </>
  )
}

const DivProductPage = styled.div`
  grid-area: 2 / 2 / 3 / 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  > .nav {
    align-self: flex-start;
  }
  > .carousel-root {
    margin-bottom: 2em;
    max-width: 400px;
    max-height: 400px;
    > div > .thumbs-wrapper > ul {
      padding: 0;
      display: flex;
      justify-content: center;
      > :nth-child(3) {
        margin-right: 0;
      }
    }
  }
  > :last-child {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: #fff; 
    > :first-child {
      background: #f8f9fa;      
      > .wrapper {
        width: 100%;
        .colorPickerPopup {
          top: 23px;
        }
        .linkPopup {
          left: -42px;
          top: 23px;
          height: 233px;
        }
        .emojiPopup {
          top: 23px;
          left: -148px;
        }
        .embeddedPopup {
          top: 23px;
          left: -111px;
        }
        .imagePopup {
          top: 23px;
          left: -186px;
        }
        > .editor {        
          width: 100%;
          padding: 0 1em 0 1em;
          border-bottom: 1px solid #F1F1F1;
        }
      }
    }
    > .post-button {
      align-self: flex-start;
      margin: 1em 0 0 1em;
    }
    > .note {
      align-self: center;
      margin-top: 1em;
    }
    > .review {
      padding: 1em;
      margin-bottom: 1em;
      > :first-child {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: .5em;
        > :first-child {
          display: flex;        
          align-items: flex-end; 
          > img {
            margin-right: .5em;
          }
          > :nth-child(2) {
            margin-right: .5em;         
          }
          > :last-child {
            cursor: pointer;
            &:hover {
              opacity: 0.6;
            } 
          }
        } 
      }
      > .wrapper {
        border: 1px solid black;
        border-radius: 5px;
        width: 100%;
      }
      > :last-child {
        display: flex;
      }
    }
  }

  @media only screen and (min-width: 850px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto 1fr auto auto auto;
    > :first-child {
      grid-area: 1 / 1 / 2 / 3;
    }
    > :nth-child(2) {
      max-width: 400px;
      max-height: 400px;
      grid-area: 2 / 1 / 3 / 2;
      justify-self: center;
    }
    > :last-child {
      grid-area: 5 / 1 / 6 / 3;
    }
  }
`
