/**
 * create.js — Create campaign page logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initCreatePage();
});

window.addEventListener('walletConnected', () => {
  document.getElementById('walletRequired')?.classList.add('hidden');
  document.getElementById('createFormWrap')?.classList.remove('hidden');
});

window.addEventListener('walletDisconnected', () => {
  document.getElementById('walletRequired')?.classList.remove('hidden');
  document.getElementById('createFormWrap')?.classList.add('hidden');
});

function initCreatePage() {
  // Show/hide form based on connection
  if (!W3.isConnected) {
    document.getElementById('walletRequired')?.classList.remove('hidden');
    document.getElementById('createFormWrap')?.classList.add('hidden');
  } else {
    document.getElementById('walletRequired')?.classList.add('hidden');
    document.getElementById('createFormWrap')?.classList.remove('hidden');
  }

  // Image preview
  const imgInput = document.getElementById('imageUrl');
  const imgPreview = document.getElementById('imgPreview');
  if (imgInput && imgPreview) {
    imgInput.addEventListener('input', () => {
      const url = imgInput.value.trim();
      if (url) {
        imgPreview.src = url;
        imgPreview.style.display = 'block';
        imgPreview.onerror = () => { imgPreview.style.display = 'none'; };
      } else {
        imgPreview.style.display = 'none';
      }
    });
  }

  // Goal amount preview
  const goalInput = document.getElementById('goal');
  const goalPreview = document.getElementById('goalPreview');
  if (goalInput && goalPreview) {
    goalInput.addEventListener('input', () => {
      const v = parseFloat(goalInput.value);
      if (!isNaN(v) && v > 0) {
        goalPreview.textContent = `≈ $${(v * 3200).toLocaleString()} USD`;
      } else {
        goalPreview.textContent = '';
      }
    });
  }

  // Duration preview
  const durationInput = document.getElementById('duration');
  const deadlinePreview = document.getElementById('deadlinePreview');
  if (durationInput && deadlinePreview) {
    durationInput.addEventListener('input', () => {
      const days = parseInt(durationInput.value);
      if (!isNaN(days) && days > 0) {
        const date = new Date(Date.now() + days * 86400000);
        deadlinePreview.textContent = `Ends ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      } else {
        deadlinePreview.textContent = '';
      }
    });
  }

  // Form submit
  const form = document.getElementById('createCampaignForm');
  if (form) {
    form.addEventListener('submit', handleCreate);
  }
}

async function handleCreate(e) {
  e.preventDefault();

  if (!W3.isConnected) {
    const connected = await connectWallet();
    if (!connected) return;
  }

  if (!W3.fundContract) {
    toast.error('Contract not deployed on this network. Please deploy first or switch to Sepolia testnet.');
    return;
  }

  const title    = document.getElementById('campaignTitle').value.trim();
  const desc     = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value;
  const imageUrl = document.getElementById('imageUrl').value.trim();
  const goal     = document.getElementById('goal').value.trim();
  const duration = document.getElementById('duration').value.trim();

  // Validation
  const errors = [];
  if (!title || title.length < 5)    errors.push('Title must be at least 5 characters');
  if (!desc  || desc.length < 20)    errors.push('Description must be at least 20 characters');
  if (!category)                     errors.push('Please select a category');
  if (!utils.isValidEth(goal))       errors.push('Enter a valid goal amount in ETH');
  if (!duration || parseInt(duration) < 1 || parseInt(duration) > 365) errors.push('Duration must be 1–365 days');

  if (errors.length) {
    toast.error(errors[0]);
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner"></div> Creating Campaign…';

  try {
    const goalWei = ethers.utils.parseEther(goal);
    const tx = await W3.fundContract.createCampaign(
      title, desc, category, imageUrl, goalWei, parseInt(duration)
    );

    toast.info('Transaction submitted. Waiting for confirmation…', 6000);

    const receipt = await tx.wait();

    // Get campaign ID from event logs
    const event = receipt.events?.find(e => e.event === 'CampaignCreated');
    const campId = event?.args?.id?.toString();

    toast.success(`Campaign #${campId} created! 🎉`);

    // Redirect to the new campaign
    setTimeout(() => {
      window.location.href = `campaign-detail.html?id=${campId}`;
    }, 1500);

  } catch (err) {
    const msg = parseContractError(err);
    toast.error('Failed to create campaign: ' + msg);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function parseContractError(err) {
  if (err.code === 4001) return 'Transaction rejected by user';
  if (err.reason) return err.reason;
  if (err.data?.message) return err.data.message;
  return err.message?.slice(0, 80) || 'Unknown error';
}
