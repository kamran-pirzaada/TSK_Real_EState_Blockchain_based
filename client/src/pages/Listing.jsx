import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';
import Contact from '../components/Contact';
import Web3 from 'web3';

// https://sabe.io/blog/javascript-format-numbers-commas#:~:text=The%20best%20way%20to%20format,format%20the%20number%20with%20commas.

export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  const [ web3, setWeb3 ] = useState(null);

  const initializeWeb3 = async (dollarValue) => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);

      console.log("Inside initializeWeb3")
      try {
        // Request access to user's MetaMask accounts
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWeb3(web3Instance);
        sendETH(dollarValue)
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.error('MetaMask not detected');
    }
  };

  // Function to send Ethereum
  const sendETH = async (dollarValue) => {
    if (!web3) {
      console.error('Web3 not initialized');
      return;
    }

    // Get user's accounts
    const accounts = await web3.eth.getAccounts();
    const ethValue = dollarValue/3500;

    // Example: Send 0.1 ETH to a specified address
    const recipientAddress = '0xe57a0C6336bf3a55d93247fd9f3CEA77b7A3b913'; // Replace with recipient's Ethereum address
    const amountToSend = web3.utils.toWei(ethValue, 'ether'); // Convert to Wei
    try {
      const tx = await web3.eth.sendTransaction({
        from: accounts[0],
        to: recipientAddress,
        value: amountToSend,
        gasPrice: "20000000000",
    gas: "21000",
      });
      console.log('Transaction Hash:', tx.transactionHash);
    } catch (error) {
      console.error('Error sending ETH:', error);
    }
  };

  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);
  
  const handleBuyEther = async (amount) => {
    if (window.sepolia) {
      const web3 = new Web3(window.sepolia);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWeb3(web3);
    }
    const value = web3.utils.toWei(amount, "ether");
    console.log("value: " + value)
    try {
      const accounts = await web3.eth.getAccounts();
      const tx = await web3.eth.sendTransaction({
        from: accounts[0],
        to: "0xe57a0C6336bf3a55d93247fd9f3CEA77b7A3b913",
        value: web3.utils.toWei(amount, 'ether'),
        
      });
      setTransactionHash(tx.transactionHash);
    } catch (error) {
      console.error(error);
    }
  }
  

  

  return (
    <main>
      {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
      {error && (
        <p className='text-center my-7 text-2xl'>Something went wrong!</p>
      )}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className='h-[550px]'
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: 'cover',
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer'>
            <FaShare
              className='text-slate-500'
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className='fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2'>
              Link copied!
            </p>
          )}
          <div className='flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4'>
            <p className='text-2xl font-semibold'>
              {listing.name} - ${' '}
              {listing.offer
                ? listing.discountPrice.toLocaleString('en-US')
                : listing.regularPrice.toLocaleString('en-US')}
              {listing.type === 'rent' && ' / month'}
            </p>
            <p className='flex items-center mt-6 gap-2 text-slate-600  text-sm'>
              <FaMapMarkerAlt className='text-green-700' />
              {listing.address}
            </p>
            <div className='flex gap-4'>
  <button
    onClick={() => {
    
      let dollarValue = 0;
      if(listing.offer) {
        dollarValue = listing.discountPrice.toLocaleString('en-US')
      } else {
        dollarValue = listing.regularPrice.toLocaleString('en-US') }
      initializeWeb3(dollarValue)
    }}
    className={`${
      listing.type === 'rent' ? 'bg-red-900' : 'bg-green-900'
    } w-full max-w-[200px] text-white text-center p-1 rounded-md cursor-pointer`}
  >
    {listing.type === 'rent' ? 'Rent' : 'Buy'}
  </button>
  {listing.offer && (
    <p className='bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
      ${+listing.regularPrice - +listing.discountPrice} OFF
    </p>
  )}
</div>

            <p className='text-slate-800'>
              <span className='font-semibold text-black'>Description - </span>
              {listing.description}
            </p>
            <ul className='text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6'>
              <li className='flex items-center gap-1 whitespace-nowrap '>
                <FaBed className='text-lg' />
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} beds `
                  : `${listing.bedrooms} bed `}
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap '>
                <FaBath className='text-lg' />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} baths `
                  : `${listing.bathrooms} bath `}
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap '>
                <FaParking className='text-lg' />
                {listing.parking ? 'Parking spot' : 'No Parking'}
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap '>
                <FaChair className='text-lg' />
                {listing.furnished ? 'Furnished' : 'Unfurnished'}
              </li>
            </ul>
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3'
              >
                Contact landlord
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}
