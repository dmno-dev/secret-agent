import { ethers } from "ethers";
import { Hono } from "hono";

export const authRoutes = new Hono();

authRoutes.post('/auth', async (c) => {
  const bodyObj = await c.req.json();

  const message = 'log into secret agent';
  const signature = bodyObj.signature;
  const address = bodyObj.address;

  try {
    const verifiedAddress = await ethers.verifyMessage(message, signature);
    console.log('signer address', verifiedAddress, address);
    if (verifiedAddress !== address) {
      return c.json({ error: 'address does not match'}, 401);
    }
  } catch (err) {
    console.log(err);
  }


  return c.json({ ok: true });
})
