import ThemedText from "@/components/general/ThemedText";
import { SIZES } from "@/data";
import type { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ArrowDown2 } from "iconsax-react-nativejs";
import React, { ReactNode, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { CustomButton } from "../general";
//

type TermsOfUseProps = {
  visible?: boolean;
  setVisible?: (val: boolean) => void;
  children?: ReactNode;
  onRequestClose?: () => void;
  onReadComplete?: () => void;
  onAccept?: () => void;
  isLoading?: boolean;
};
const TermsOfUse = ({
  visible = true,
  setVisible,
  children,
  onRequestClose,
  onReadComplete,
  onAccept = () => {},
  isLoading = false,
}: TermsOfUseProps) => {
  const theme = useTheme<Theme>();
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEndReached =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20; // 20 for buffer

    if (isEndReached && !hasReachedEnd) {
      setHasReachedEnd(true);
      onReadComplete?.();
    }
  };

  const handleScrollToEnd = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };
  const content = (
    <View
      style={[
        styles.popContainer,
        {
          padding: 16,
          borderRadius: 24,
          backgroundColor: theme.colors.mainBackgroundColor,
        },
      ]}
    >
      <View style={styles.handler} />
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <ThemedText
            type="subTitleLg"
            style={styles.title}
            color={theme.colors.bodyTextColor}
          >
            Terms of use
          </ThemedText>
          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              Introduction
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              Welcome to Zap! These Terms of Use govern your use of our
              application. By using our services, you agree to comply with these
              terms. Please read them carefully.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              These Zap Terms of Use (&quot;Terms&quot;) govern your use of the
              services provided by Zap in relation to the Digital Currency
              Exchange Platform (&quot;Platform&quot;). By accessing,
              downloading, using or clicking on “I agree” to accept any Zap
              Services (as defined below) provided by Zap (as defined below),
              you agree that you have read, understood and accepted all of the
              terms and conditions stipulated in these Terms as well as our
              Privacy Policy. In addition, when using some features of the
              Services, you may be subject to specific additional terms and
              conditions applicable to those features. Please read the terms
              carefully as they govern your use of Zap Services. These terms
              contain important provisions including an arbitration provision
              that requires all claims to be resolved by way of legally binding
              arbitration. The terms of the arbitration provision are set forth
              in Clause 15, “Dispute Resolution”. As with any asset, the values
              of Digital Currencies may fluctuate significantly and there is a
              substantial risk of economic losses when purchasing, selling,
              holding or investing in Digital Currencies and their derivatives.
              By making use of Zap Services, you acknowledge and agree that: (a)
              you are aware of the risks associated with transactions of digital
              currencies and their derivatives; (b) you shall assume all risks
              related to the use of Zap Services and transactions of digital
              currencies and their derivatives; and (c) Zap shall not be liable
              for any such risks or adverse outcomes. By accessing, using or
              attempting to use Zap Services in any capacity, you acknowledge
              that you accept and agree to be bound by these Terms. If you do
              not agree, do not access Zap or utilize Zap Services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              1. Definitions
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`Digital Assets  Digital Currencies, their derivatives, or other types of digitalized assets with a certain value. 
  
 Digital Currencies Encrypted or digital tokens or cryptocurrencies with a certain value that are based on blockchain and cryptography technologies and are issued and managed in a decentralized form. Fiat Partner Any third-party service provider, with which Zap may partner in connection with any Fiat Services. 
 
 Fiat Services 

 KYC 
  
 Purchasing Digital Assets at with one or more fiat currencies by using either your balance, or your debit card or credit card. withdrawing one or more fiat currencies from Zap either into your bank account, or to your debit card or credit card. 

 Know-your-customer  process  that  Zap  has  put  in  place  before entering a business relationship or conducting transactions with its Users. As part of this process, Zap may do anything that it deems necessary  to  identify  Users,  verify  their  identity,  scrutinize  and investigate User transactions, or comply with any applicable law or regulation. 

 Non-Custodial Wallets    
  
 Software tools provided within the Zap ecosystem that enable Users to manage their private keys and interact with blockchain networks directly. These wallets allow Users to store, transfer, and receive Digital Assets without Zap retaining custody of their private keys. 
  
 Users  All individuals, institutions or organizations that access, download, or use Zap or Zap Services and who meet the criteria and conditions stipulated by Zap. 
  
 Zap  An  ecosystem  comprising  of  Zap  websites,  mobile  applications, clients, applets, and other applications that are developed to offer Zap  Services,  and  includes  independently  operated  platforms, websites and clients within the ecosystem. 
  
 Zap Accounts  The  foundational  virtual  accounts,  including  main  accounts  and subaccounts, which are opened by Zap for Users to record on Zap their usage of Zap Services, transactions, asset changes and basic information. Zap Accounts serve as the basis for Users to enjoy and exercise their rights on Zap. 
  
 Zap Operators All parties that run Zap including but not limited to legal persons unincorporated organizations and teams that provide Zap Services and are responsible for such services. 
  
 Zap Services Various services provided to you by Zap include, wallet creation, connection and management features, transactions made through the integrated wallet features which are signed directly by the User and broadcast  to  the  blockchain,  wallets  compatibility  with  major blockchain networks and tokens as described in the help center or platform  documentation, that  are  based  on  Internet  and/or blockchain  technologies  and  offered  via  Zap  websites,  mobile applications, clients, and other forms (including new ones enabled by future technological development). 

 Zap Platform Rules  All  rules,  interpretations,  announcements,  statements,  letters  of consent and other contents that have been and will be subsequently released by Zap, as well as all regulations, implementation rules, product process descriptions, and announcements published in the Help Center or within products or service processes.`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              2. Acceptance of Terms
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`2.1.By using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as any additional terms and conditions that may apply. If you do not agree with these Terms, you must not use the Platform.`}
            </Text>
          </View>
          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              3. User Accounts
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`3.1.To access certain features of the Platform, you are required to create an account. You  must  provide  accurate  and  complete  information  during  the  registration process and promptly update any changes. You are responsible for maintaining the security and confidentiality of your account and password. 
3.2.You are solely responsible for all activities that occur under your account. You agree not to use the Platform for any illegal, fraudulent, or unauthorized purposes.You must comply with all applicable laws and regulations while using the Platform. 
3.3.The Zap Account can only be used by the account registrant. Zap reserves the right to suspend, freeze or cancel the use of Zap Accounts by persons other than account registrant.  If  you  suspect  or  become  aware  of  any  unauthorized  use  of  your username  and  password,  you  should  notify  Zap  immediately.  Zap  assumes  no liability for any loss or damage arising from the use of Zap Account by you or any third party with or without your authorization. 
3.4.By  registering  to  use  a  Zap  Account,  you  represent  and  warrant  that:  
(i)  as  an individual, you are at least 18 or are of legal age to form a binding contract under applicable laws; 
(ii) as an individual, legal person, or other organization, you have full legal capacity and sufficient authorizations to enter into these Terms; 
(iii) you have not been previously suspended or removed from using the Zap Platform or the Zap Services; 
(iv) you do not have an existing Zap Account; 
(v) if you act as an employee or agent of a legal entity, and enter into these Terms on their behalf, you represent and warrant that you have all the necessary rights and authorizations to bind such legal entity and to access and use the Zap Platform and Zap Services on behalf  of  such  legal  entity;  and  (vi)  your  use  of  the  Zap  Platform  and  the  Zap Services will not violate any and all laws and regulations applicable to you or the legal entity on whose behalf you are acting, including but not limited to regulations on anti-money laundering, anti-corruption, and counter-terrorist financing. 
3.5.Your registration of an account with Zap will be deemed your agreement to provide required personal information for identity verification. 
3.6.When creating an Order, the User is fully responsible for the correctness of the chosen  direction  of  the  Exchange,  the  specified  receiving  address,  the  type  of exchange rate and amount, as well as for being aware of the features of the selected currencies  and  networks.  Zap  is  not  responsible  if  the  transaction  was  sent  to incorrectly specified details when creating an order. To make sure in the chosen direction and the details entered when creating the Order, the User can specify his email address to receive notifications about the status of the Order, containing all information about the Order, before the direct payment of the Order. 
3.7.Users will have the ability to generate or link external crypto wallets for managing their  Digital  Assets.  These  wallets  are  non-custodial,  meaning  Users  retain  full control and responsibility for their private keys. 
3.8. Refunds may be issued in accordance with Zap’s Customer Refund Policy. 
3.9.Refunds may be issued at the discretion of Zap and by using the Platform you agree to this. A refund may be issued but the gas fees shall be deducted when performing the refund. 
3.10. Users may delete their Zap Accounts by reaching out to the support unit. The deletion process for a User’s Zap Account shall require up to 10 business days. However, User data will be retained for 30 days following the deletion of the User's Zap Account. `}
            </Text>
          </View>
          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              4. Privacy and Data Protection
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`4.1. Zap collects and processes user data in accordance with applicable privacy laws. By using the Platform, you consent to Zap's collection, use, and processing of your personal information as described in the Privacy Policy. 
4.2. Zap employs reasonable security measures to protect user data from unauthorized access, disclosure, alteration, or destruction. You understand and accept the risks associated with the transmission of data over the internet. 
4.3.Zap may share user data with trusted third-party service providers or partners for the purpose of providing and improving the Platform. Zap will ensure that such third  parties  are  bound  by  appropriate  confidentiality  and  data  protection obligations. 
4.4.Zap  will  only  collect  metadata  required  to  facilitate  wallet  interactions  (e.g., blockchain network usage, transaction statuses) for performance monitoring and compliance. Wallet keys, seed phrases, and private data remain inaccessible to Zap. 
4.5.By using the Platform, you consent to Zap's use of your data as described in these Terms and the Privacy Policy. You have the right to withdraw your consent and request  the  deletion  of  your  data,  subject  to  applicable  legal  and  regulatory requirements.`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              5. Intellectual Property
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`5.1. Zap retains all rights, title, and interest in the Platform, including any intellectual property rights associated with it. You agree not to reproduce, modify, distribute, or  create  derivative  works  based  on  the  Platform  without  Zap's  prior  written consent. 
5.2. By submitting any content, including but not limited to text, images, or videos, to the Platform, you grant Zap a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, and publish such content for the purpose of operating and promoting the Platform. `}
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              6. Prohibited Conduct
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`6.1.You agree not to engage in any of the following prohibited activities while using the Platform: 
a. Violate  Zap  Platform  Rules,  use  the  Platform  for  any  illegal,  fraudulent,  or unauthorized purpose, or in violation of any applicable laws or regulations. 
b. Attempt to gain unauthorized access to the Platform, user accounts, or computer systems or networks associated with the Platform. 
c. Interfere with or disrupt the operation of the Platform or servers or networks connected to the Platform, or violate any requirements, procedures, policies, or regulations of such networks. 
d. Introduce any viruses, worms, malware, or any other harmful or destructive code to the Platform. 
6.2. Users agree not to engage in activities that compromise the security of their wallets, misuse the wallet integration features for illegal purposes, or exploit bugs in the wallet functionalities for unauthorized gains. `}
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              7. Disclaimer of Warranty
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`7.1.The  Platform  is  provided  on  an  "as-is"  and  "as  available"  basis  without  any warranties,  express  or  implied.  Zap  disclaims  all  warranties,  including  but  not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              8. Indemnification
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`8.1.You  agree  to  indemnify  and  hold  harmless  Zap  Operators,  their  affiliates, contractors, licensors, and their respective directors, officers, employees and agents from and against any claims, actions, proceedings, investigations, demands, suits, costs, expenses and damages (including attorneys’ fees, fines or penalties imposed by any regulatory authority) arising out of or related to 
(i) your use of, or conduct in  connection  with,  Zap  Services,  
(ii)  your  breach  or  our  enforcement  of  these Terms, or 
(iii) your violation of any applicable law, regulation, or rights of any third party  during  your  use  of  Zap  Services.  If  you  are  obligated  to  indemnify  Zap Operators,  their  affiliates,  contractors,  licensors,  and  their  respective  directors, officers, employees or agents pursuant to these Terms, Zap will have the right, in its sole discretion, to control any action or proceeding and to determine whether Zap wishes to settle, and if so, on what terms.`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              9. Anti-Money Laundering Procedure
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`9.1.Zap may determine a direct link to criminal activity based on information from business  partners,  public  sources,  victim  complaints  against  Zap,  and  law enforcement requests. 
9.2.Zap reserves the right not to disclose the source of information about the connection of funds sent by the User with criminal activity. 
9.3.By accepting these Terms, you acknowledge and agree that the transaction you sent can be verified using the security system of the Service. 
9.4.By accepting these Terms, you acknowledge and agree to provide full details of the origin of the funds sent by you and confirm the honesty and legality of the receipt of these funds upon suspension of the Order and the corresponding request by Zap. 
9.5.By accepting these Terms, you agree and warrant that true, accurate, current and complete information about the origin of funds sent is provided and you take full responsibility for its accuracy, completeness and reliability. 
9.6.The data must be provided directly by the sender of funds under the Order. 
9.7.If you refuse to provide data about the origin of the funds sent or provide false data, and if the data you provide confirms your connection to criminal activity, Zap has the right to freeze the funds for the subsequent return of funds to the victims with the assistance of law enforcement agencies. 
9.8.In  some  cases,  when  for  objective  reasons  the  User  cannot  provide  sufficient evidence of the source of the funds received, as well as in the case of a personal acquaintance of the sender with the alleged criminal who sent the funds to the User, as an exception, the User may be asked to undergo identity verification. `}
            </Text>
          </View>
          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              10. Limitation of Liability
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`10.1. To  the  maximum  extent  permitted  by  law,  Zap  and  its  officers,  directors, employees,  or  agents  shall  not  be  liable  for  any  indirect,  incidental,  special, consequential, or exemplary damages, including but not limited to damages for loss of profits, goodwill, data, or other intangible losses arising out of or in connection with your use of the Platform. 
10.2.  Notwithstanding the foregoing, in no event will the liability of Zap, its affiliates and  their  respective  shareholders,  members,  directors,  officers,  employees, attorneys, agents, representatives, suppliers or contractors arising out of services offered  by  or  on  behalf  of  Zap  and  its  affiliates,  any  performance  or  non-performance of Zap services, or any other product, service or other item, whether under contract, statute, strict liability or other theory, exceed the amount of the fees paid  by  you  to  Zap  under  these  terms  in  the  twelve-month  period  immediately preceding the event giving rise to the claim for liability`}
            </Text>
          </View>
          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              11. Termination
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`11.1. Zap reserves the right to suspend or terminate your access to the Platform at any 
time, without notice or liability, for any reason, including but not limited to a breach 
of these Terms. 
11.2. The above account controls may also be applied in the following cases: 
a. Zap Account is subject to a governmental proceeding, criminal investigation or other 
pending litigation; 
b. We detect unusual activities in the Zap Account; 
c. We detect unauthorized access to the Zap Account; 
d. We are required to do so by a court order or command by a regulatory/government 
authority.`}
            </Text>
          </View>
          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              12. Modifications
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`12.1.  Zap may update or modify these Terms at any time, and such changes will be effective upon posting the updated Terms on the Platform. It is your responsibility to  review  these  Terms  periodically.  Continued  use  of  the  Platform  after  any modifications shall constitute your consent to such changes. 
12.2. Due  to  the  rapid  development  of  Digital  Currencies  and  Zap,  these  Terms between you and Zap Operators do not enumerate or cover all rights and obligations of each party, and do not guarantee full alignment with needs arising from future development.  Therefore,  the  privacy  policy,  Zap  Platform  Rules,  and  all  other agreements entered into separately between you and Zap are deemed supplementary terms that are an integral part of these terms and shall have the same legal effect. Your use of Zap Services is deemed your acceptance of the above supplementary terms. `}
            </Text>
          </View>
          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              3. Risk Disclosure
            </Text>
            <Text style={[styles.text, { color: theme.colors.bodyTextColor }]}>
              {`13.1. You acknowledge and agree that you are aware of the risks associated with transactions with digital currencies and their derivatives. 
13.2. You acknowledge and agree that your use of the Service is at your own risk. 
13.3. You assume all risks associated with transactions with digital currencies and their derivatives. Zap is not responsible for any such risks or adverse results. 
13.4. You  acknowledge  that  by  utilizing  Zap's  wallet  features,  you  are  solely responsible for safeguarding access to your wallets. Any loss arising from stolen, lost, or mismanaged credentials will be the sole responsibility of the User. 
13.5. All transactions signed and initiated by Users through their wallets are final and irreversible.`}
            </Text>
          </View>
          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              14. Compliance
            </Text>
            <Text
              style={[styles.text, { color: theme.colors.bodyTextColor }]}
            >{`14.1. It is Users’ responsibility to abide by local laws in relation to the legal usage of Zap  Services  in  their  local  jurisdiction  as  well  as  other  laws  and  regulations applicable to Users. Users must also factor, to the extent of their local laws all aspects of taxation, the withholding, collection, reporting and remittance to their appropriate tax authorities.  
 14.2. All users of Zap Services acknowledge and declare that their funds come from legitimate sources and do not originate from illegal activities; users agree that Zap will require them to provide or otherwise collect the necessary information and materials as per relevant laws or government orders to verify the legality of the sources and use of their funds. Zap maintains a stance of cooperation with law enforcement authorities globally and will not hesitate to seize, freeze, terminate Users’ accounts and funds which are flagged out or investigated by legal mandate.`}</Text>
          </View>
          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              15. Dispute Resolution
            </Text>
            <Text
              style={[styles.text, { color: theme.colors.bodyTextColor }]}
            >{`These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute arising out of or in connection with these Terms shall be resolved through arbitration in accordance with the Arbitration rules and procedure of the Federal Republic of Nigeria. Each party agrees to submit to the exclusive jurisdiction of the Arbitration Institution in Nigeria and any award from the arbitration process shall be binding on all parties while constituting the termination of the claim. In disputes concerning wallet interactions, Zap’s role as a facilitator will be considered. Zap will not mediate claims related to private key loss or unauthorized access to wallets.`}</Text>
          </View>
          <View style={styles.section}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              16. Severability
            </Text>
            <Text
              style={[styles.text, { color: theme.colors.bodyTextColor }]}
            >{`If  any  provision  of  these Terms  is  held  to  be  invalid  or  unenforceable,  the  remaining provisions shall continue in full force and effect.`}</Text>
          </View>
          <View style={[styles.section, { marginBottom: 100 }]}>
            <Text
              style={[styles.header, { color: theme.colors.bodyTextColor }]}
            >
              17. Entire Agreement
            </Text>
            <Text
              style={[styles.text, { color: theme.colors.bodyTextColor }]}
            >{`These Terms, together with any additional terms and conditions that may apply, constitute the entire agreement between you and Zap regarding your use of the Platform, superseding any prior agreements or understandings.`}</Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.scrollToBottom}
          onPress={handleScrollToEnd}
        >
          <ArrowDown2 size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      <CustomButton
        text="Accept"
        onPress={onAccept}
        width="100%"
        borderRadius={80}
      />
      {children}
    </View>
  );

  // If being used inside AppBottomSheet, just return content
  if (onAccept !== undefined) {
    return content;
  }

  // If being used as standalone modal, wrap with Modal
  return (
    <Modal 
      visible={visible} 
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        onRequestClose?.();
        setVisible?.(false);
      }}
    >
      <Pressable
        onPress={() => {
          onRequestClose?.();
          setVisible?.(false);
        }}
        style={styles.bg}
      />
      <View style={styles.modalContent}>
        {content}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SIZES.height * 0.5,
    width: SIZES.width - 64,
    alignSelf: "center",
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
    fontFamily: "PlusJakartaSans_Regular",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "PlusJakartaSans_Bold",
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_Regular",
  },
  bold: {
    fontWeight: "bold",
  },
  bg: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
  },
  popContainer: {
    width: SIZES.width - 32,
    alignSelf: "center",
    minHeight: SIZES.height * 0.65,
    position: "absolute",
    bottom: 46,
  },
  handler: {
    height: 4,
    width: 32,
    borderRadius: 24,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
    marginTop: 12,
  },
  scrollToBottom: {
    width: 48,
    height: 48,
    backgroundColor: "#6045FF",
    borderRadius: 24,
    position: "absolute",
    bottom: 32,
    right: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});

export default TermsOfUse;
