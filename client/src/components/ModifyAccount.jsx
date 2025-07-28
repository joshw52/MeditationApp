import { useEffect, useState } from 'react';
import axios from 'axios';

const ModifyAccount = () => {
  const [accountEmail, setAccountEmail] = useState('');
  const [accountMsg, setAccountMsg] = useState('');
  const [accountOldPassword, setAccountOldPassword] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountPasswordConfirm, setAccountPasswordConfirm] = useState('');
  const [pwordMsg, setPwordMsg] = useState('');

  const loadAccountInformation = () =>
    axios
      .get('/api/accountInfoLoad')
      .then((res) => setAccountEmail(res.data.email));

  useEffect(() => {
    loadAccountInformation();
  }, []);

  const modifyAccount = () =>
    accountEmail === ''
      ? setAccountMsg('All fields must be filled out!')
      : axios
          .patch('/api/accountModify', {
            accountEmail,
          })
          .then((res) => {
            const { accountModified, accountMsg } = res.data;
            setAccountMsg(
              accountModified
                ? accountMsg
                : accountMsg || 'Account Modification Error'
            );
          });

  const changePassword = () => {
    if (
      accountOldPassword === '' ||
      accountPassword === '' ||
      accountPasswordConfirm === ''
    ) {
      setPwordMsg('All fields must be filled out!');
    } else if (accountPassword !== accountPasswordConfirm) {
      setPwordMsg("New Password and Confirmation don't match!");
    } else if (accountPassword.length < 8) {
      setPwordMsg('New Password must be at least 8 characters');
    } else {
      axios
        .patch('/api/accountLoginModify', {
          accountOldPassword,
          accountPassword,
        })
        .then((res) => {
          const { pwordChangeMsg } = res.data;
          setPwordMsg(pwordChangeMsg);
        });
    }
  };

  return (
    <div className="accountModification">
      <h2>Modify Account Information</h2>
      <div className="meditationForm">
        <input
          name="accountEmail"
          onChange={(e) => setAccountEmail(e.target.value)}
          placeholder="Email"
          type="text"
          value={accountEmail}
        />
        <div className="accountModButtons">
          <input
            className="loginSite"
            name="accountSubmit"
            onClick={loadAccountInformation}
            type="submit"
            value="Cancel"
          />
          <input
            className="loginSite"
            name="accountSubmit"
            onClick={modifyAccount}
            type="submit"
            value="Modify Account"
          />
        </div>
      </div>
      {accountMsg.length > 0 && <div className="accountMsg">{accountMsg}</div>}
      <h2>Change your Password</h2>
      <div className="meditationForm">
        <input
          name="accountOldPassword"
          onChange={(e) => setAccountOldPassword(e.target.value)}
          placeholder="Old Password"
          type="password"
          value={accountOldPassword}
        />
        <input
          name="accountPassword"
          onChange={(e) => setAccountPassword(e.target.value)}
          placeholder="New Password"
          type="password"
          value={accountPassword}
        />
        <input
          name="accountPasswordConfirm"
          onChange={(e) => setAccountPasswordConfirm(e.target.value)}
          placeholder="Confirm New Password"
          type="password"
          value={accountPasswordConfirm}
        />
        <input
          className="loginSite"
          name="accountSubmit"
          onClick={changePassword}
          type="submit"
          value="Change Password"
        />
      </div>
      {pwordMsg.length > 0 && <div className="accountMsg">{pwordMsg}</div>}
    </div>
  );
};

export default ModifyAccount;
