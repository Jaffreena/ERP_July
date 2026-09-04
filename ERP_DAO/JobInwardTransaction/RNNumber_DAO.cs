using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO.JobInwardTransaction
{
    public class JIRN_Numbering_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();
        public DataSet JIRN_NumberingDB(JIRN_Numbering_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JIRN_Numbering_SP");
            Db.AddInParameter(DbC, "@JIRN_Number", DbType.Int64, P_DTO.JIRN_Number);
            Db.AddInParameter(DbC, "@JIRN_Method", DbType.Int64, P_DTO.JIRN_Method);
            Db.AddInParameter(DbC, "@JIRN_Date", DbType.Int32, P_DTO.JIRN_Date);
            Db.AddInParameter(DbC, "@JIRN_EndDate", DbType.Int32, P_DTO.JIRN_EndDate);
            Db.AddInParameter(DbC, "@JIRN_StartingNumber", DbType.Int32, P_DTO.JIRN_StartingNumber);
            Db.AddInParameter(DbC, "@JIRN_NumberofDigits", DbType.Int32, P_DTO.JIRN_NumberofDigits);
            Db.AddInParameter(DbC, "@JIRN_PrefilZero", DbType.Int64, P_DTO.JIRN_PrefilZero);
            Db.AddInParameter(DbC, "@JIRN_Frequency", DbType.Int64, P_DTO.JIRN_Frequency);
            Db.AddInParameter(DbC, "@JIRN_Particulars", DbType.String, P_DTO.JIRN_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);
            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }
    public class JIDN_Numbering_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JIDN_NumberingDB(DNNumber_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JIDN_Numbering_SP");

            Db.AddInParameter(DbC, "@DNN_Number", DbType.Int64, P_DTO.DNN_Number);
            Db.AddInParameter(DbC, "@DNN_Method", DbType.Int64, P_DTO.DNN_Method);
            Db.AddInParameter(DbC, "@DNN_Date", DbType.Int32, P_DTO.DNN_Date);
            Db.AddInParameter(DbC, "@DNN_EndDate", DbType.Int32, P_DTO.DNN_EndDate);
            Db.AddInParameter(DbC, "@DNN_StartingNumber", DbType.Int32, P_DTO.DNN_StartingNumber);
            Db.AddInParameter(DbC, "@DNN_NumberofDigits", DbType.Int32, P_DTO.DNN_NumberofDigits);
            Db.AddInParameter(DbC, "@DNN_PrefilZero", DbType.Int64, P_DTO.DNN_PrefilZero);
            Db.AddInParameter(DbC, "@DNN_Frequency", DbType.Int64, P_DTO.DNN_Frequency);
            Db.AddInParameter(DbC, "@DNN_Particulars", DbType.String, P_DTO.DNN_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }

    public class JIJWI_Numbering_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JIJWI_NumberingDB(JIJWI_Numbering_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JIJWI_Numbering_SP");

            Db.AddInParameter(DbC, "@JIJWI_Number", DbType.Int64, P_DTO.JIJWI_Number);
            Db.AddInParameter(DbC, "@JIJWI_Method", DbType.Int64, P_DTO.JIJWI_Method);
            Db.AddInParameter(DbC, "@JIJWI_Date", DbType.Int32, P_DTO.JIJWI_Date);
            Db.AddInParameter(DbC, "@JIJWI_EndDate", DbType.Int32, P_DTO.JIJWI_EndDate);
            Db.AddInParameter(DbC, "@JIJWI_StartingNumber", DbType.Int32, P_DTO.JIJWI_StartingNumber);
            Db.AddInParameter(DbC, "@JIJWI_NumberofDigits", DbType.Int32, P_DTO.JIJWI_NumberofDigits);
            Db.AddInParameter(DbC, "@JIJWI_PrefilZero", DbType.Int64, P_DTO.JIJWI_PrefilZero);
            Db.AddInParameter(DbC, "@JIJWI_Frequency", DbType.Int64, P_DTO.JIJWI_Frequency);
            Db.AddInParameter(DbC, "@JIJWI_Particulars", DbType.String, P_DTO.JIJWI_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }

    public class JSONumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JSONumberDB(JSONumber_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JSONumbering_SP");

            Db.AddInParameter(DbC, "@JSON_Number", DbType.Int64, P_DTO.JSON_Number);
            Db.AddInParameter(DbC, "@JSON_Method", DbType.Int64, P_DTO.JSON_Method);
            Db.AddInParameter(DbC, "@JSON_Date", DbType.Int32, P_DTO.JSON_Date);
            Db.AddInParameter(DbC, "@JSON_EndDate", DbType.Int32, P_DTO.JSON_EndDate);
            Db.AddInParameter(DbC, "@JSON_StartingNumber", DbType.Int32, P_DTO.JSON_StartingNumber);
            Db.AddInParameter(DbC, "@JSON_NumberofDigits", DbType.Int32, P_DTO.JSON_NumberofDigits);
            Db.AddInParameter(DbC, "@JSON_PrefilZero", DbType.Int64, P_DTO.JSON_PrefilZero);
            Db.AddInParameter(DbC, "@JSON_Frequency", DbType.Int64, P_DTO.JSON_Frequency);
            Db.AddInParameter(DbC, "@JSON_Particulars", DbType.String, P_DTO.JSON_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }
    public class JI_CONVNumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_CONVNumberDB(JI_CONVNumber_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JI_CONVNumbering_SP");

            Db.AddInParameter(DbC, "@JICN_Number", DbType.Int64, P_DTO.JICN_Number);
            Db.AddInParameter(DbC, "@JICN_Method", DbType.Int64, P_DTO.JICN_Method);
            Db.AddInParameter(DbC, "@JICN_Date", DbType.Int32, P_DTO.JICN_Date);
            Db.AddInParameter(DbC, "@JICN_EndDate", DbType.Int32, P_DTO.JICN_EndDate);
            Db.AddInParameter(DbC, "@JICN_StartingNumber", DbType.Int32, P_DTO.JICN_StartingNumber);
            Db.AddInParameter(DbC, "@JICN_NumberofDigits", DbType.Int32, P_DTO.JICN_NumberofDigits);
            Db.AddInParameter(DbC, "@JICN_PrefilZero", DbType.Int64, P_DTO.JICN_PrefilZero);
            Db.AddInParameter(DbC, "@JICN_Frequency", DbType.Int64, P_DTO.JICN_Frequency);
            Db.AddInParameter(DbC, "@JICN_Particulars", DbType.String, P_DTO.JICN_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }

    public class JIJWI_SVO_Numbering_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JIJWI_SVO_NumberingDB(JIJWI_SVO_Numbering_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JIJWI_SVO_Numbering_SP");

            Db.AddInParameter(DbC, "@JIJWI_SVO_Number", DbType.Int64, P_DTO.JIJWI_SVO_Number);
            Db.AddInParameter(DbC, "@JIJWI_SVO_Method", DbType.Int64, P_DTO.JIJWI_SVO_Method);
            Db.AddInParameter(DbC, "@JIJWI_SVO_Date", DbType.Int32, P_DTO.JIJWI_SVO_Date);
            Db.AddInParameter(DbC, "@JIJWI_SVO_EndDate", DbType.Int32, P_DTO.JIJWI_SVO_EndDate);
            Db.AddInParameter(DbC, "@JIJWI_SVO_StartingNumber", DbType.Int32, P_DTO.JIJWI_SVO_StartingNumber);
            Db.AddInParameter(DbC, "@JIJWI_SVO_NumberofDigits", DbType.Int32, P_DTO.JIJWI_SVO_NumberofDigits);
            Db.AddInParameter(DbC, "@JIJWI_SVO_PrefilZero", DbType.Int64, P_DTO.JIJWI_SVO_PrefilZero);
            Db.AddInParameter(DbC, "@JIJWI_SVO_Frequency", DbType.Int64, P_DTO.JIJWI_SVO_Frequency);
            Db.AddInParameter(DbC, "@JIJWI_SVO_Particulars", DbType.String, P_DTO.JIJWI_SVO_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }

    public class JIFRT_SVO_Numbering_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JIFRT_SVO_NumberingDB(JIFRT_SVO_Numbering_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JIFRT_SVO_Numbering_SP");

            Db.AddInParameter(DbC, "@JIFRT_SVO_Number", DbType.Int64, P_DTO.JIFRT_SVO_Number);
            Db.AddInParameter(DbC, "@JIFRT_SVO_Method", DbType.Int64, P_DTO.JIFRT_SVO_Method);
            Db.AddInParameter(DbC, "@JIFRT_SVO_Date", DbType.Int32, P_DTO.JIFRT_SVO_Date);
            Db.AddInParameter(DbC, "@JIFRT_SVO_EndDate", DbType.Int32, P_DTO.JIFRT_SVO_EndDate);
            Db.AddInParameter(DbC, "@JIFRT_SVO_StartingNumber", DbType.Int32, P_DTO.JIFRT_SVO_StartingNumber);
            Db.AddInParameter(DbC, "@JIFRT_SVO_NumberofDigits", DbType.Int32, P_DTO.JIFRT_SVO_NumberofDigits);
            Db.AddInParameter(DbC, "@JIFRT_SVO_PrefilZero", DbType.Int64, P_DTO.JIFRT_SVO_PrefilZero);
            Db.AddInParameter(DbC, "@JIFRT_SVO_Frequency", DbType.Int64, P_DTO.JIFRT_SVO_Frequency);
            Db.AddInParameter(DbC, "@JIFRT_SVO_Particulars", DbType.String, P_DTO.JIFRT_SVO_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
   
    }
}
