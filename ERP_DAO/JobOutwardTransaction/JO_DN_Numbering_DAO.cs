using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;
using System.Data.Common;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JO_DN_Numbering_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JO_DN_NumberingDB(JO_DNNumber_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JODN_Numbering_SP");

            // SP params are still @DNN_*
            Db.AddInParameter(DbC, "@DNN_Number", DbType.Int64, P_DTO.JODN_NM_Number);
            Db.AddInParameter(DbC, "@DNN_Method", DbType.Int64, P_DTO.JODN_NM_Method);
            Db.AddInParameter(DbC, "@DNN_Date", DbType.Int32, P_DTO.JODN_NM_Date);
            Db.AddInParameter(DbC, "@DNN_EndDate", DbType.Int32, P_DTO.JODN_NM_EndDate);
            Db.AddInParameter(DbC, "@DNN_StartingNumber", DbType.Int32, P_DTO.JODN_NM_StartingNumber);
            Db.AddInParameter(DbC, "@DNN_NumberofDigits", DbType.Int32, P_DTO.JODN_NM_NumberofDigits);
            Db.AddInParameter(DbC, "@DNN_PrefilZero", DbType.Int64, P_DTO.JODN_NM_PrefilZero);
            Db.AddInParameter(DbC, "@DNN_Frequency", DbType.Int64, P_DTO.JODN_NM_Frequency);
            Db.AddInParameter(DbC, "@DNN_Particulars", DbType.String, P_DTO.JODN_NM_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }

    public class JO_DN_NextNumber_DAO
    {
        DBConnect DB = new DBConnect();

        public JO_DN_NextNumber_DTO JO_DN_NextNumberDB(JO_DN_NextNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_DN_GetNextNumber_SP");
            db.AddInParameter(cmd, "@Id", DbType.Int32, DTO.Id);

            switch (DTO.Id)
            {
                case 101:
                    db.AddInParameter(cmd, "@DNDate", DbType.Date, DTO.DNDate);
                    db.AddOutParameter(cmd, "@NextNumber", DbType.Int32, 4);
                    db.AddOutParameter(cmd, "@Prefix", DbType.String, 30);
                    db.AddOutParameter(cmd, "@Suffix", DbType.String, 30);
                    db.AddOutParameter(cmd, "@NumberOfDigits", DbType.Int32, 4);
                    db.AddOutParameter(cmd, "@PrefilZero", DbType.Boolean, 1);
                    db.ExecuteNonQuery(cmd);

                    DTO.NextNumber = Convert.ToInt32(db.GetParameterValue(cmd, "@NextNumber"));
                    DTO.Prefix = Convert.ToString(db.GetParameterValue(cmd, "@Prefix"));
                    DTO.Suffix = Convert.ToString(db.GetParameterValue(cmd, "@Suffix"));
                    DTO.NumberOfDigits = Convert.ToInt32(db.GetParameterValue(cmd, "@NumberOfDigits"));
                    DTO.PrefilZero = Convert.ToBoolean(db.GetParameterValue(cmd, "@PrefilZero"));

                    string seqStr = DTO.NextNumber.ToString();
                    if (DTO.PrefilZero)
                        seqStr = seqStr.PadLeft(DTO.NumberOfDigits, '0');
                    DTO.FinalDNNumber = DTO.Prefix + seqStr + DTO.Suffix;
                    break;
            }
            return DTO;
        }
    }
}