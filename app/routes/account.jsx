import {json} from '@shopify/remix-oxygen';
import {Form, NavLink, Outlet, useLoaderData} from '@remix-run/react';
import {
  CUSTOMER_DETAILS_QUERY,
  UPDATE_BUYER_IDENTITY,
  CREATE_STOREFRONT_TOKEN,
} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  const storefront_token_data = await context.customerAccount.mutate(
    CREATE_STOREFRONT_TOKEN,
  );

  const storefrontCustomerAccessToken =
    storefront_token_data.data.storefrontCustomerAccessTokenCreate
      .customerAccessToken;

  let update_buyer_identity_result = await context.storefront.mutate(
    UPDATE_BUYER_IDENTITY,
    {
      variables: {
        buyerIdentity: {
          customerAccessToken: storefrontCustomerAccessToken,
        },
        cartId: context.cart.getCartId(),
      },
    },
  );

  console.log('CREATE STOREFRONT CAT', JSON.stringify(storefront_token_data));

  console.log(
    'UPDATE BUYER IDENTIY',
    JSON.stringify(update_buyer_identity_result),
  );

  return json(
    {
      customer: data.customer,
      accessToken: await context.customerAccount.getAccessToken(),
      storefrontCustomerAccessToken:
        storefront_token_data.data.storefrontCustomerAccessTokenCreate
          .customerAccessToken,
      checkoutUrl: context.cart.checkoutUrl,
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer, accessToken, storefrontCustomerAccessToken, checkoutUrl} =
    useLoaderData();
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const credentials = btoa(`${clientId}:${clientSecret}`);

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName} `
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="account">
      <h1>{heading}</h1>
      <pre>customerAccessToken</pre>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxWidth: '50%',
          overflowWrap: 'break-word',
        }}
      >
        {accessToken}
      </pre>

      <pre>storefrontCustomerAccessToken</pre>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxWidth: '50%',
          overflowWrap: 'break-word',
        }}
      >
        {storefrontCustomerAccessToken}
      </pre>

      <pre>checkoutUrl</pre>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxWidth: '50%',
          overflowWrap: 'break-word',
        }}
      >
        {checkoutUrl}
      </pre>

      <pre>Authorization</pre>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxWidth: '50%',
          overflowWrap: 'break-word',
        }}
      >
        {credentials}
      </pre>
      <br />
      <AccountMenu />
      <br />
      <br />
      <Outlet context={{customer}} />
    </div>
  );
}

function AccountMenu() {
  function isActiveStyle({isActive, isPending}) {
    return {
      fontWeight: isActive ? 'bold' : undefined,
      color: isPending ? 'grey' : 'black',
    };
  }

  return (
    <nav role="navigation">
      <NavLink to="/account/orders" style={isActiveStyle}>
        Orders &nbsp;
      </NavLink>
      &nbsp;|&nbsp;
      <NavLink to="/account/profile" style={isActiveStyle}>
        &nbsp; Profile &nbsp;
      </NavLink>
      &nbsp;|&nbsp;
      <NavLink to="/account/addresses" style={isActiveStyle}>
        &nbsp; Addresses &nbsp;
      </NavLink>
      &nbsp;|&nbsp;
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      &nbsp;<button type="submit">Sign out</button>
    </Form>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
