import React, { JSX, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

// import { authActions } from "../../modules/auth/state/reducer/auth-slice";
// import AuthBvnVerificationInput from "../../modules/auth/ui/AuthBvnVerificationInput";
// import AuthBvnVerificationSuccess from "../../modules/auth/ui/AuthBvnVerificationSuccess";
// import AuthIdentityVerificationOverview from "../../modules/auth/ui/AuthIdentityVerificationOverview";
// import AuthIdVerificationInput from "../../modules/auth/ui/AuthIdVerificationInput";
// import AuthIdVerificationUpload from "../../modules/auth/ui/AuthIdVerificationUpload";
// import AuthOtp from "../../modules/auth/ui/AuthOtp";
// import AuthPhoneNumberInput from "../../modules/auth/ui/AuthPhoneNumberInput";
// import AuthPhoneNumberOtp from "../../modules/auth/ui/AuthPhoneNumberOtp";
// import AuthVerificationIntro from "../../modules/auth/ui/AuthVerificationIntro";
// import AuthVerificationSubmitted from "../../modules/auth/ui/AuthVerificationSubmitted";
// import Referral from "../../modules/auth/ui/Referral";
// import Signin from "../../modules/auth/ui/Signin";
// import { useModal } from "../contexts/modal";
// import { useOnboardingContext } from "../contexts/onboarding";
// import { Onboarding } from "../contexts/onboarding/types";
// import { appRemoveFromLocalStorage, appSaveToLocalStorage, StorageKeys } from "../storage/app_localstorage";
// import { AppDispatch, AppRootState } from "../store/store";
// import { isUserFullyOnboarded, submittedAllVerificationDocuments } from "../utils/app_utils_methods";

// import { useAuth } from "./useAuth";
import { EmailVerification, EnterUsername, LoginToZap } from "@/components";
import UsernameSuccess from "@/components/onboarding/UsernameSuccess";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppRootState } from "@/state";
import { isUserFullyOnboarded, submittedAllVerificationDocuments } from "./OnboardingProvider";
import { Onboarding } from "./types";
import { useOnboardingContext } from "./useOnboardingContext";

const onboardingSteps: {
  [key in Onboarding]: JSX.Element
} = {
  [Onboarding.Signin]: <LoginToZap key={Onboarding.Signin} />,
  [Onboarding.AuthOtp]: <EmailVerification key={Onboarding.AuthOtp} />,
  [Onboarding.Referral]: <EnterUsername key={Onboarding.Referral} />,
  [Onboarding.AuthVerificationIntro]: <UsernameSuccess key={Onboarding.AuthVerificationIntro} />,
  [Onboarding.AuthPhoneNumberInput]: <></>,
  [Onboarding.AuthPhoneNumberOtpVerification]: <></>,
  [Onboarding.AuthIdentityVerificationOverview]: <></>,
  [Onboarding.AuthBvnVerificationInput]: <></>,
  [Onboarding.AuthBvnVerificationSuccess]: <></>,
  [Onboarding.AuthIdVerificationInput]: <></>,
  [Onboarding.AuthIdVerificationUpload]: <></>,
  [Onboarding.AuthVerificationSubmitted]: <></>,
};

const useOnboarding = (): {
  handleOpenOnbaordingModal: (onboardingStep?: Onboarding) => void,
  userIsFullyVerified: boolean,
  userSubmittedAllVerificationDocuments: boolean
  currentOnboardingStepComponent: React.ReactNode
} => {
  const {
    currentOnboardingStep,
  } = useOnboardingContext();
  const { updateUser } = useKyc();
  // const dispatch = useDispatch<AppDispatch>();

  // const { openModal, setModalContent, closeModal } = useModal();

  // Get the current user from Redux
  const { user } = useSelector((state: AppRootState) => state.kyc);

  // Create a ref to always access the latest user
  const userRef = useRef(user);

  // Update the ref when user changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const userIsFullyVerified = isUserFullyOnboarded(user);
  const userSubmittedAllVerificationDocuments = submittedAllVerificationDocuments(user);

  // const [userCurrentlyOnboarding, setUserCurrentlyOnboarding] = useState(false);
  // const [currentModalId, setCurrentModalId] = useState<number | null>(null);

  // Track previous onboarding step to detect changes
  // const [prevOnboardingStep, setPrevOnboardingStep] = useState<Onboarding | null>(null);
  const [currentOnboardingStepComponent, setCurrentOnboardingStepComponent] = useState<React.ReactNode>(onboardingSteps[currentOnboardingStep]);
  // const [viewedOnboardingComponents, setViewedOnboardingComponents] = useState<React.ReactNode[]>([]);

  // Create a ref-based onClosed callback that will always use the latest user data
  // const handleModalClosed = useCallback(() => {
  //   setUserCurrentlyOnboarding(false);
  //   setCurrentModalId(null);



  //   if (userRef.current?.isGuest) {
  //     const userWithoutEmail = { ...userRef.current, email: undefined };

  //     updateUser(userWithoutEmail);

  //     // appSaveToLocalStorage(StorageKeys.USER_PROFILE, userWithoutEmail);

  //     return;
  //   }

  //   // Use userRef.current to access the latest user value
  //   if (!userRef.current?._id) {
  //     // dispatch(authActions.clearUser());
  //     // appRemoveFromLocalStorage(StorageKeys.USER_PROFILE);
  //     // appRemoveFromLocalStorage(StorageKeys.TOKEN_DATA);
  //   }
  //   // Include dispatch in dependencies but not userRef
  // }, [dispatch, updateUser]);

  const handleOpenOnbaordingModal = useCallback((onboardingStep?: Onboarding): void => {
    if (!onboardingStep) {
      updateUser({
        ...user,
        metaData: {}
      });
    } else if (onboardingStep === Onboarding.AuthIdentityVerificationOverview) {
      updateUser({
        ...user,
        metaData: {
          userPhoneNumberData: {
            userskippedPhoneNumberOnboarding: true
          }
        }
      });
    }

    // const modalId = openModal(onboardingSteps[currentOnboardingStep], {
    //   isDismissible: false,
    //   showCloseButton: true,
    //   onClosed: handleModalClosed,
    // });

    // setUserCurrentlyOnboarding(true);
    // setCurrentModalId(modalId);
    setCurrentOnboardingStepComponent(onboardingSteps[currentOnboardingStep]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOnboardingStep]);
  // }, [currentOnboardingStep, openModal, handleModalClosed]);

  // Effect to update modal content when currentOnboardingStep changes
  useEffect(() => {
    // if (userCurrentlyOnboarding && currentModalId !== null) {
    if (userIsFullyVerified && currentOnboardingStep === Onboarding.AuthVerificationSubmitted) {
      // Close the modal if user is fully verified and we're on the final step
      // closeModal(currentModalId);
      // setUserCurrentlyOnboarding(false);
      // setCurrentModalId(null);
    } else if (currentOnboardingStepComponent !== onboardingSteps[currentOnboardingStep] && !userIsFullyVerified) {
      // Update the modal content with the new step
      // setModalContent(onboardingSteps[currentOnboardingStep], currentModalId);
      // Update previous step to current
      setCurrentOnboardingStepComponent(onboardingSteps[currentOnboardingStep]);
    }
    // }
  }, [currentOnboardingStep, currentOnboardingStepComponent, userIsFullyVerified]);
  // }, [currentModalId, currentOnboardingStep, prevOnboardingStep, setModalContent, userCurrentlyOnboarding, userIsFullyVerified, closeModal]);

  // // Effect to fetch user profile on mount
  // useEffect(() => {
  //   if (user?._id) {
  //     // fetchUserProfile();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return {
    handleOpenOnbaordingModal,
    userIsFullyVerified,
    userSubmittedAllVerificationDocuments,
    currentOnboardingStepComponent,
  };
};

export default useOnboarding;