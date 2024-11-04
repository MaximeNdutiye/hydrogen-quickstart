// NOTE: https://shopify.dev/docs/api/customer/latest/objects/Customer
export const CUSTOMER_FRAGMENT = `#graphql
  fragment Customer on Customer {
    id
    firstName
    lastName
    defaultAddress {
      ...Address
    }
    addresses(first: 6) {
      nodes {
        ...Address
      }
    }
  }
  fragment Address on CustomerAddress {
    id
    formatted
    firstName
    lastName
    company
    address1
    address2
    territoryCode
    zoneCode
    city
    zip
    phoneNumber
  }
`;

// NOTE: https://shopify.dev/docs/api/customer/latest/queries/customer
export const CUSTOMER_DETAILS_QUERY = `#graphql
  query CustomerDetails {
    customer {
      ...Customer
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

export const CREATE_STOREFRONT_TOKEN = `#graphql
mutation storefrontCustomerAccessTokenCreate {
  storefrontCustomerAccessTokenCreate {
    customerAccessToken
    userErrors {
      field
      message
    }
  }
}  
`;

export const UPDATE_BUYER_IDENTITY = `#graphql
mutation updateCartBuyerIdentity($buyerIdentity: CartBuyerIdentityInput!, $cartId: ID!) {
  cartBuyerIdentityUpdate(buyerIdentity: $buyerIdentity, cartId: $cartId) {
    cart {
			id
			buyerIdentity {
				email
				phone
			}
    }
    userErrors {
      field
      message
    }
  }
}
`;
