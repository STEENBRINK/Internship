namespace game
{
    /** Utility class for various player related functions */
    export class PlayerUtils
    {
        // ---- LOCATION ----
        static GetLocation(world: ut.World): string
        {
            return world.getConfigData(PlayerInformation).Location;
        }

        static SetLocation(world: ut.World, location: string): void
        {
            if (null == location || location == "") { console.error("Don't overwrite location with empty string."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.Location = location;
            world.setConfigData(p);
        }

        // ---- GENDER ----
        static GetGender(world: ut.World): string
        {
            return world.getConfigData(PlayerInformation).Gender;
        }

        static SetGender(world: ut.World, gender: string): void
        {
            if (null == gender || gender == "") { console.error("Don't overwrite gender with empty string."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.Gender = gender;
            world.setConfigData(p);
        }

        // ---- IP ADDRESS ----
        static GetIPAddress(world: ut.World): string
        {
            return world.getConfigData(PlayerInformation).IPAddress;
        }

        static SetIPAddress(world: ut.World, ipAddress: string): void
        {
            if (null == ipAddress || ipAddress == "") { console.error("Don't overwrite ipAddress with empty string."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.IPAddress = ipAddress;
            world.setConfigData(p);
        }

        // ---- DEVICE ID ----
        static GetDeviceID(world: ut.World): string
        {
            return world.getConfigData(PlayerInformation).DeviceID;
        }

        static SetDeviceID(world: ut.World, deviceID: string): void
        {
            if (null == deviceID || deviceID == "") { console.error("Don't overwrite deviceID with empty string."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.DeviceID = deviceID;
            world.setConfigData(p);
        }

        // ---- NAME ----
        static GetName(world: ut.World): string
        {
            if (null == world.getConfigData(PlayerInformation).Name || world.getConfigData(PlayerInformation).Name == "")
            {
                console.error("The player has not entered a valid username");
                return null;
            }

            return world.getConfigData(PlayerInformation).Name;
        }

        static SetName(world: ut.World, name: string): void
        {
            if (null == name || name == "") { console.error("Don't overwrite name with empty string."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.Name = name;
            world.setConfigData(p);
        }

        // ---- EMAIL ----
        static GetEmail(world: ut.World): string
        {
            if (null == world.getConfigData(PlayerInformation).Email || world.getConfigData(PlayerInformation).Email == "")
            {
                console.error("The player has not entered a valid email");
                return null;
            }

            return world.getConfigData(PlayerInformation).Email;
        }

        static SetEmail(world: ut.World, email: string): void
        {
            if (null == email || email == "") { console.error("Don't overwrite email with empty string."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.Email = email;
            world.setConfigData(p);
        }

        // ---- PHONENUMBER ----
        static GetPhoneNumber(world: ut.World): string
        {
            return world.getConfigData(PlayerInformation).PhoneNumber;
        }

        static SetPhoneNumber(world: ut.World, phonenumber: string): void
        {
            if (null == phonenumber || phonenumber == "") { console.error("Don't overwrite phonenumber with empty string."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.PhoneNumber = phonenumber;
            world.setConfigData(p);
        }

        // ---- BIRTHDATE ----
        static GetBirthdate(world: ut.World): string
        {
            return world.getConfigData(PlayerInformation).Birthday;
        }

        static SetBirthdate(world: ut.World, birthdate: string): void
        {
            if (null == birthdate || birthdate == "") { console.error("Don't overwrite birthday with empty string."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.Birthday = birthdate;
            world.setConfigData(p);
        }

        // ---- RESPINS ----
        static GetRespins(world: ut.World): number
        {
            return world.getConfigData(PlayerInformation).Respins;
        }

        static SetRespins(world: ut.World, respins: number): void
        {
            if (null == respins || respins === undefined) { console.error("Don't overwrite respins with NaN."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.Respins = respins;
            world.setConfigData(p);
        }

        // ---- ADBLOCK ----
        static GetAdblockState(world: ut.World): boolean
        {
            return world.getConfigData(PlayerInformation).AdblockEnabled;
        }

        static SetAdblockState(world: ut.World, adblockState: boolean): void
        {
            let p = world.getConfigData(PlayerInformation);
            p.AdblockEnabled = adblockState;
            world.setConfigData(p);
        }

        // ---- SCORE ----
        static GetScore(world: ut.World): number
        {
            return world.getConfigData(PlayerInformation).Score;
        }

		/** Set the score to the provided amount.
		 *
		 *  WARNING: Does NOT add the provided amount!
		 */
        static SetScore(world: ut.World, score: number): void
        {
            if (null == PlayerUtils.SetScore.caller) { console.warn("The request was denied."); return; }
            if (null == score || score === undefined) { console.error("Don't overwrite score with NaN."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.Score = score;
            world.setConfigData(p);
        }

        /** Adds the provided amount to the score. */
        static AddScore(world: ut.World, amount: number): void
        {
            if (null == PlayerUtils.AddScore.caller) { console.warn("The request was denied."); return; }
            if (null == amount || amount === undefined) { console.error("Don't overwrite score amount with NaN."); return; }

            let p = world.getConfigData(PlayerInformation);
            p.Score += amount;
            world.setConfigData(p);
        }
    }
}